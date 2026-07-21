const Message = require("../models/Message");
const Channel = require("../models/Channel");
const Server = require("../models/Server");

const createMessageService = async (content, channelId, userId) => {
    if (!content || !channelId) {
        throw new Error("Content and channel ID are required");
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
        throw new Error("Channel not found");
    }

    const server = await Server.findById(channel.server);

    if (!server) {
        throw new Error("Server not found");
    }

    const isMember = server.members
        .map(member => member.toString())
        .includes(userId.toString());

    if (!isMember) {
        throw new Error("You are not a member of this server");
    }

    const message = await Message.create({
        content,
        sender: userId,
        channel: channel._id,
    });

    return await message.populate("sender", "username avatar");
};

module.exports = {
    createMessageService,
};