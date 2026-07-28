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

module.exports = {
    getOrCreateConversation,
};