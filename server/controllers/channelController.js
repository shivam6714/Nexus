const Channel = require("../models/Channel");
const Server = require("../models/Server");

const createChannel = async (req, res) => {
    try {
        const { name, description, serverId, type } = req.body;

        if (!name || !serverId) {
            return res.status(400).json({
                success: false,
                message: "Name and server ID is required",
            });
        }
        const server = await Server.findById(serverId);
        if (!server) {
            return res.status(404).json({
                success: false,
                message: "Server not found"
            });
        }

        const isMember = server.members
            .map(member => member.toString())
            .includes(req.user._id.toString());

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not member of this server",
            });
        }
        const channel = await Channel.create({
            name,
            description,
            server: serverId,
            createdBy: req.user._id,
            type,
        });

        server.channels.push(channel._id);

        await server.save();

        res.status(201).json({
            success: true,
            message: "Channel created successfully",
            channel,
        });
    }

    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getChannels = async (req, res) => {
    try {
        const { serverId } = req.params;

        if (!serverId) {
            return res.status(400).json({
                success: false,
                message: "Server ID is required",
            });
        }

        const server = await Server.findById(serverId);

        if (!server) {
            return res.status(404).json({
                success: false,
                message: "Server not found",
            });
        }

        const isMember = server.members
            .map(member => member.toString())
            .includes(req.user._id.toString());

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this server",
            });
        }

        const channels = await Channel.find({
            server: serverId,
        });

        res.status(200).json({
            success: true,
            channels,
        });

    } catch (error) {
        console.error("Create Channel Error:");
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
module.exports = {
    createChannel,
    getChannels,
};