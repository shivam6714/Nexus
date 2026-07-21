const Message = require("../models/Message");
const Channel = require("../models/Channel");
const Server = require("../models/Server");

const createMessage = async (req, res) => {
    try {

        const { content, channelId } = req.body;

        if (!content || !channelId) {
            return res.status(400).json({
                success: false,
                message: "Content and channel ID are required",
            });
        }
        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found",
            });
        }

        const server = await Server.findById(channel.server);

        const isMember = server.members
            .map(member => member.toString())
            .includes(req.user._id.toString());

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this server",
            });
        }
        const message = await Message.create({
            content,
            sender: req.user._id,
            channel: channel._id,
        });
        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            message,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { channelId } = req.params;

        if (!channelId) {
            return res.status(400).json({
                success: false,
                message: "Channel ID is required",
            });
        }

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found",
            });
        }

        const server = await Server.findById(channel.server);

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

        const messages = await Message.find({
            channel: channelId,
        }).populate("sender", "username avatar");

        res.status(200).json({
            success: true,
            messages,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createMessage,
    getMessages,
};