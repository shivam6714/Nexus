const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        icon: {
            type: String,
            default: "",
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        channels: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Channel",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Server", serverSchema);