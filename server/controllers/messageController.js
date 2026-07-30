const { createMessageService } = require("../services/messageService");
const Message = require("../models/Message");
const Channel = require("../models/Channel");
const Server = require("../models/Server");
const Conversation = require("../models/Conversation");

const createMessage = async (req, res) => {
    try {
        const { content, channelId } = req.body;

        const message = await createMessageService(
            content,
            channelId,
            req.user._id
        );

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message,
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

const getDMMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required",
            });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        const isParticipant = conversation.participants.some(
            (participantId) => participantId.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this conversation",
            });
        }

        const messages = await Message.find({
            conversation: req.params.conversationId,
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

const createDMMessage = async (req, res) => {
    try {
        const { content, conversationId } = req.body;

        if (!content || !conversationId) {
            return res.status(400).json({
                success: false,
                message: "Content and conversation ID are required",
            });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        const isParticipant = conversation.participants.some(
            (participantId) => participantId.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this conversation",
            });
        }

        const message = await Message.create({
            content,
            sender: req.user._id,
            channel: null,
            conversation: conversation._id,
        });

        const populatedMessage = await message.populate("sender", "username avatar");

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: populatedMessage,
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
    createDMMessage,
    getDMMessages,
};