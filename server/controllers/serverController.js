const Server = require("../models/Server");
const Channel = require("../models/Channel");
const generateInviteCode = require("../utils/generateInviteCode");

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

        req.app.get("io").to(`server-${server._id}`).emit("server-member-joined", {
            user: req.user,
            serverId: server._id
        });

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
            .populate("members", "username email");

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

module.exports = {
    createServer,
    getMyServers,
    joinServer,
    getServerMembers,
    uploadServerIcon,
};