const Server = require("../models/Server");
const Channel = require("../models/Channel");
const generateInviteCode = require("../utils/generateInviteCode");
const {
    emitServerUpdated,
    emitMemberLeft,
    emitOwnerTransferred,
    emitServerDeleted,
    emitMemberJoined
} = require("../socket/serverEvents");

const createServer = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        // Create the server
        const server = await Server.create({
            name,
            description,
            owner: req.user._id,
            members: [req.user._id],
            inviteCode: generateInviteCode(),
        });

        // Create the default #general channel
        const generalChannel = await Channel.create({
            name: "general",
            description: "General discussion",
            server: server._id,
            createdBy: req.user._id,
        });

        // Add the channel to the server
        server.channels.push(generalChannel._id);

        await server.save();

        res.status(201).json({
            success: true,
            message: "Server created successfully",
            server,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getMyServers = async (req, res) => {
    try {
        const servers = await Server.find({
            members: req.user._id,
        });

        res.status(200).json({
            success: true,
            servers,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const joinServer = async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({
                success: false,
                message: "Invite code is required",
            });
        }

        const server = await Server.findOne({ inviteCode });

        if (!server) {
            return res.status(404).json({
                success: false,
                message: "Invalid invite code",
            });
        }

        const isMember = server.members.some(
            (memberId) => memberId.toString() === req.user._id.toString()
        );

        if (isMember) {
            return res.status(400).json({
                success: false,
                message: "You are already a member of this server",
            });
        }

        server.members.push(req.user._id);

        await server.save();

        emitMemberJoined(req.app.get("io"), server._id, req.user);

        res.status(200).json({
            success: true,
            message: "Joined server successfully",
            server,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
const getServerMembers = async (req, res) => {
    try {
        const { serverId } = req.params;

        const server = await Server.findById(serverId)
            .populate("members", "username email avatar");

        if (!server) {
            return res.status(404).json({
                success: false,
                message: "Server not found",
            });
        }

        const isMember = server.members.some(
            (member) => member._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        res.status(200).json({
            success: true,
            members: server.members,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
const uploadServerIcon = async (req, res) => {
    try {
        const { serverId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image",
            });
        }

        const server = await Server.findById(serverId);

        if (!server) {
            return res.status(404).json({
                success: false,
                message: "Server not found",
            });
        }

        // Only the server owner can change the icon
        if (server.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the server owner can change the server icon",
            });
        }

        server.icon = `/uploads/server-icons/${req.file.filename}`;

        await server.save();

        res.status(200).json({
            success: true,
            message: "Server icon updated successfully",
            server,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getServerInfo = async (req, res) => {
    try {
        const { serverId } = req.params;

        const server = await Server.findById(serverId);

        if (!server) {
            return res.status(404).json({
                success: false,
                message: "Server not found",
            });
        }

        const isMember = server.members.some(
            (memberId) => memberId.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        res.status(200).json({
            success: true,
            server: {
                name: server.name,
                icon: server.icon,
                inviteCode: server.inviteCode,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const renameServer = async (req, res) => {
    try {
        const { serverId } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const server = await Server.findById(serverId);
        if (!server) {
            return res.status(404).json({ success: false, message: "Server not found" });
        }

        if (server.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only the server owner can rename the server" });
        }

        server.name = name;
        await server.save();

        emitServerUpdated(req.app.get("io"), server._id, server);

        res.status(200).json({ success: true, message: "Server renamed successfully", server });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const leaveServer = async (req, res) => {
    try {
        const { serverId } = req.params;

        const server = await Server.findById(serverId);

        if (!server) {
            return res.status(404).json({
                success: false,
                message: "Server not found",
            });
        }

        const isMember = server.members.some(
            (memberId) => memberId.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this server",
            });
        }

        if (server.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Server owner cannot leave the server. You must transfer ownership first.",
            });
        }

        server.members = server.members.filter(
            (memberId) => memberId.toString() !== req.user._id.toString()
        );

        await server.save();

        emitMemberLeft(req.app.get("io"), server._id, req.user._id);

        res.status(200).json({
            success: true,
            message: "Successfully left the server",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const transferAndLeave = async (req, res) => {
    try {
        const { serverId } = req.params;
        const { newOwnerId } = req.body;

        const server = await Server.findById(serverId);
        if (!server) {
            return res.status(404).json({ success: false, message: "Server not found" });
        }

        if (server.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only the server owner can transfer ownership" });
        }

        if (!server.members.some(memberId => memberId.toString() === newOwnerId)) {
            return res.status(400).json({ success: false, message: "Selected user is not a member of this server" });
        }

        server.owner = newOwnerId;
        server.members = server.members.filter(memberId => memberId.toString() !== req.user._id.toString());

        await server.save();

        emitOwnerTransferred(req.app.get("io"), server._id, newOwnerId);
        emitMemberLeft(req.app.get("io"), server._id, req.user._id);

        res.status(200).json({ success: true, message: "Ownership transferred and left server successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const deleteServer = async (req, res) => {
    try {
        const { serverId } = req.params;

        const server = await Server.findById(serverId);
        if (!server) {
            return res.status(404).json({ success: false, message: "Server not found" });
        }

        if (server.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only the server owner can delete the server" });
        }

        await Server.findByIdAndDelete(serverId);

        emitServerDeleted(req.app.get("io"), serverId);

        res.status(200).json({ success: true, message: "Server deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    createServer,
    getMyServers,
    joinServer,
    getServerMembers,
    uploadServerIcon,
    getServerInfo,
    leaveServer,
    transferAndLeave,
    deleteServer,
    renameServer,
};