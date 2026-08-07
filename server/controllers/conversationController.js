const Conversation = require("../models/Conversation");

const getOrCreateConversation = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }

        const currentUserId = req.user._id;

        if (currentUserId.toString() === userId.toString()) {
            return res.status(400).json({
                message: "Cannot create conversation with yourself",
            });
        }

        let conversation = await Conversation.findOne({
            participants: {
                $all: [currentUserId, userId],
                $size: 2,
            },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [currentUserId, userId],
            });
        }
        return res.status(200).json({
            conversation,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

const getConversations = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        const conversations = await Conversation.find({
            participants: currentUserId,
        })
            .populate("participants", "_id username avatar")
            .sort({ lastMessageAt: -1 });

        // Map the other participant for frontend convenience
        const formattedConversations = conversations.map((conv) => {
            const otherParticipant = conv.participants.find(
                (p) => p._id.toString() !== currentUserId.toString()
            );

            return {
                _id: conv._id,
                conversationId: conv._id,
                otherParticipant: otherParticipant || conv.participants[0], // fallback if it's a self-dm
                lastMessagePreview: conv.lastMessagePreview,
                lastMessageAt: conv.lastMessageAt,
            };
        });

        res.status(200).json({
            conversations: formattedConversations,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
        });
    }
};

module.exports = {
    getOrCreateConversation,
    getConversations,
};