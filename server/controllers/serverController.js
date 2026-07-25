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

module.exports = {
    createServer,
    getMyServers,
    joinServer,
};