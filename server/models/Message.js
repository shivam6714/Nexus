const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
            default: null,
        },
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            default: null,
        },
        edited: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Message", messageSchema);