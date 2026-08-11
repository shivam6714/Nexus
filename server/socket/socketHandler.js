const { createMessageService } = require("../services/messageService");
const onlineUsers = require("./onlineUsers");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const fs = require("fs");
const path = require("path");

const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("Authenticated user:", socket.user.username);

      
        const userId = socket.user._id.toString();

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        io.emit(
            "online-users",
            [...onlineUsers.keys()]
        );

        console.log(
            `[Presence] ${socket.user.username} connected`
        );

        socket.on("join-channel-room", (channelId) => {
            socket.join(channelId);
            console.log(`${socket.user.username} joined room ${channelId}`);
        });

        
        socket.on("send-message", async (data) => {
            console.log(
                `[Message] ${socket.user.username} is sending a message to channel ${data.channelId}`
            );

            try {
                const { content, channelId, replyTo, attachment } = data;

                if (replyTo) {
                    const replyMessage = await Message.findById(replyTo);
                    if (!replyMessage) {
                        return socket.emit("message-error", { success: false, message: "Replied message not found." });
                    }
                    if (replyMessage.channel?.toString() !== channelId) {
                        return socket.emit("message-error", { success: false, message: "Cannot reply to a message from another channel." });
                    }
                }

                const message = await createMessageService(
                    content,
                    channelId,
                    socket.user._id,
                    attachment
                );

                if (replyTo) {
                    message.replyTo = replyTo;
                    await message.save();
                }

                const populatedMessage = await message.populate([
                    { path: "sender", select: "username avatar" },
                    { path: "replyTo", populate: { path: "sender", select: "username avatar" } }
                ]);

                io.to(channelId).emit(
                    "receive-message",
                    populatedMessage
                );

                console.log(
                    `${socket.user.username} sent a message in ${data.channelId}`
                );
            } catch (error) {
                console.log(error);

                socket.emit("message-error", {
                    success: false,
                    message: error.message,
                });
            }
        });

      
        socket.on("send-dm", async (data) => {
            try {
                const { conversationId, content, replyTo, attachment } = data;

                if (replyTo) {
                    const replyMessage = await Message.findById(replyTo);
                    if (!replyMessage) {
                        return socket.emit("message-error", { success: false, message: "Replied message not found." });
                    }
                    if (replyMessage.conversation?.toString() !== conversationId) {
                        return socket.emit("message-error", { success: false, message: "Cannot reply to a message from another conversation." });
                    }
                }
                
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) return;

                const message = await Message.create({
                    content: content || "",
                    sender: socket.user._id,
                    channel: null,
                    conversation: conversation._id,
                    replyTo: replyTo || null,
                    attachment: attachment || null,
                });

                const populatedMessage = await message.populate([
                    { path: "sender", select: "username avatar" },
                    { path: "replyTo", populate: { path: "sender", select: "username avatar" } }
                ]);

                const receiverId = conversation.participants.find(
                    (pId) => pId.toString() !== socket.user._id.toString()
                );

                const updateQuery = {
                    $set: {
                        lastMessagePreview: content,
                        lastMessageAt: new Date()
                    }
                };

                if (receiverId) {
                    updateQuery.$inc = {
                        [`unreadCounts.${receiverId.toString()}`]: 1
                    };
                }

                await Conversation.updateOne({ _id: conversation._id }, updateQuery);

                // Emit to all participants
                conversation.participants.forEach((participantId) => {
                    const participantSockets = onlineUsers.get(participantId.toString());
                    if (participantSockets) {
                        participantSockets.forEach((socketId) => {
                            io.to(socketId).emit("receive-dm", populatedMessage);
                        });
                    }
                });
            } catch (error) {
                console.error("DM Socket Error:", error);
            }
        });

        socket.on("mark-dm-read", async (conversationId) => {
            try {
                const conversation = await Conversation.findById(conversationId);
                if (conversation && conversation.participants.includes(socket.user._id)) {
                    await Conversation.updateOne(
                        { _id: conversationId },
                        { $set: { [`unreadCounts.${socket.user._id.toString()}`]: 0 } }
                    );
                }
            } catch (error) {
                console.error("Mark DM Read Error:", error);
            }
        });

        socket.on("edit-message", async (data) => {
            try {
                const { messageId, content } = data;
                
                console.log("[EDIT SOCKET] Received:", {
                    messageId,
                    content,
                    userId: socket.user._id.toString()
                });

                if (!messageId || content === undefined) {
                    return socket.emit("message-error", { success: false, message: "Message ID and content are required." });
                }
                
                const trimmedContent = content.trim();
                if (!trimmedContent) {
                    return socket.emit("message-error", { success: false, message: "Content cannot be empty." });
                }

                const message = await Message.findById(messageId);
                
                console.log("[EDIT SOCKET] Found message:", message);

                if (!message) {
                    return socket.emit("message-error", { success: false, message: "Message not found." });
                }

                if (message.sender.toString() !== socket.user._id.toString()) {
                    return socket.emit("message-error", { success: false, message: "Not authorized to edit this message." });
                }

                message.content = trimmedContent;
                message.edited = true;
                await message.save();

                const populatedMessage = await message.populate("sender", "username avatar");

                console.log("[EDIT SOCKET] Broadcasting edited message:", {
                    messageId: populatedMessage._id,
                    channel: message.channel,
                    conversation: message.conversation
                });

                if (message.channel) {
                    io.to(message.channel.toString()).emit("message-edited", populatedMessage);
                } else if (message.conversation) {
                    const latestMessage = await Message.findOne({ conversation: message.conversation }).sort({ createdAt: -1 });
                    if (latestMessage && latestMessage._id.toString() === message._id.toString()) {
                        await Conversation.updateOne(
                            { _id: message.conversation },
                            { $set: { lastMessagePreview: trimmedContent } }
                        );
                    }
                    io.to(`dm-${message.conversation.toString()}`).emit("message-edited", populatedMessage);
                }
            } catch (error) {
                console.error("Edit Message Error:", error);
                socket.emit("message-error", { success: false, message: "Failed to edit message." });
            }
        });

        socket.on("delete-message", async (data) => {
            try {
                const { messageId } = data;
                
                console.log("[DELETE SOCKET] Received:", {
                    messageId,
                    userId: socket.user._id.toString()
                });

                if (!messageId) {
                    return socket.emit("message-error", { success: false, message: "Message ID is required." });
                }

                const message = await Message.findById(messageId);
                
                console.log("[DELETE SOCKET] Found message:", message);

                if (!message) {
                    return socket.emit("message-error", { success: false, message: "Message not found." });
                }

                if (message.sender.toString() !== socket.user._id.toString()) {
                    return socket.emit("message-error", { success: false, message: "Not authorized to delete this message." });
                }

                const channelId = message.channel;
                const conversationId = message.conversation;

                if (message.attachment) {
                    try {
                        const filename = path.basename(message.attachment);
                        const baseUploadsDir = path.join(__dirname, "..", "uploads", "messages");
                        const absolutePath = path.join(baseUploadsDir, filename);

                        if (absolutePath.startsWith(baseUploadsDir)) {
                            if (fs.existsSync(absolutePath)) {
                                await fs.promises.unlink(absolutePath);
                                console.log("[DELETE SOCKET] Deleted physical attachment:", absolutePath);
                            } else {
                                console.warn("[DELETE SOCKET] Attachment file not found on disk:", absolutePath);
                            }
                        } else {
                            console.warn("[DELETE SOCKET] Security Warning: Attachment path traversal attempt:", message.attachment);
                        }
                    } catch (fileError) {
                        console.error("[DELETE SOCKET] Error deleting physical attachment:", fileError);
                    }
                }

                await message.deleteOne();

                console.log("[DELETE SOCKET] Broadcasting deletion:", {
                    messageId,
                    channel: channelId,
                    conversation: conversationId
                });

                if (channelId) {
                    io.to(channelId.toString()).emit("message-deleted", { messageId });
                } else if (conversationId) {
                    io.to(`dm-${conversationId.toString()}`).emit("message-deleted", { messageId });
                }
            } catch (error) {
                console.error("Delete Message Error:", error);
                socket.emit("message-error", { success: false, message: "Failed to delete message." });
            }
        });

        socket.on("add-reaction", async (data) => {
            try {
                const { messageId, emoji } = data;
                
                if (!messageId || !emoji) {
                    return socket.emit("message-error", { success: false, message: "Message ID and emoji are required." });
                }

                const trimmedEmoji = emoji.trim();
                if (!trimmedEmoji) {
                    return socket.emit("message-error", { success: false, message: "Emoji cannot be empty." });
                }

                const message = await Message.findById(messageId);
                if (!message) {
                    return socket.emit("message-error", { success: false, message: "Message not found." });
                }

                const existingReaction = message.reactions.find((r) => r.emoji === trimmedEmoji);

                if (!existingReaction) {
                    message.reactions.push({
                        emoji: trimmedEmoji,
                        users: [socket.user._id]
                    });
                } else {
                    const hasReacted = existingReaction.users.some(
                        (userId) => userId.toString() === socket.user._id.toString()
                    );
                    if (!hasReacted) {
                        existingReaction.users.push(socket.user._id);
                    }
                }

                await message.save();

                const populatedMessage = await message.populate([
                    { path: "sender", select: "username avatar" },
                    { path: "replyTo", populate: { path: "sender", select: "username avatar" } }
                ]);

                if (message.channel) {
                    io.to(message.channel.toString()).emit("message-reaction-updated", populatedMessage);
                } else if (message.conversation) {
                    io.to(`dm-${message.conversation.toString()}`).emit("message-reaction-updated", populatedMessage);
                }
            } catch (error) {
                console.error("Add Reaction Error:", error);
                socket.emit("message-error", { success: false, message: "Failed to add reaction." });
            }
        });

        socket.on("remove-reaction", async (data) => {
            try {
                const { messageId, emoji } = data;
                
                if (!messageId || !emoji) {
                    return socket.emit("message-error", { success: false, message: "Message ID and emoji are required." });
                }

                const message = await Message.findById(messageId);
                if (!message) {
                    return socket.emit("message-error", { success: false, message: "Message not found." });
                }

                const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji.trim());
                if (reactionIndex === -1) return;

                const reaction = message.reactions[reactionIndex];
                reaction.users = reaction.users.filter(
                    (userId) => userId.toString() !== socket.user._id.toString()
                );

                if (reaction.users.length === 0) {
                    message.reactions.splice(reactionIndex, 1);
                }

                await message.save();

                const populatedMessage = await message.populate([
                    { path: "sender", select: "username avatar" },
                    { path: "replyTo", populate: { path: "sender", select: "username avatar" } }
                ]);

                if (message.channel) {
                    io.to(message.channel.toString()).emit("message-reaction-updated", populatedMessage);
                } else if (message.conversation) {
                    io.to(`dm-${message.conversation.toString()}`).emit("message-reaction-updated", populatedMessage);
                }
            } catch (error) {
                console.error("Remove Reaction Error:", error);
                socket.emit("message-error", { success: false, message: "Failed to remove reaction." });
            }
        });

        socket.on("join-server-room", (serverId) => {
            socket.join(`server-${serverId}`);
            console.log(`${socket.user.username} joined server room server-${serverId}`);
        });

        socket.on("leave-server-room", (serverId) => {
            socket.leave(`server-${serverId}`);
            console.log(`${socket.user.username} left server room server-${serverId}`);
        });

        socket.on("join-dm-room", async (conversationId) => {
            try {
                // Ensure the user is actually a participant before joining
                const conversation = await Conversation.findById(conversationId);
                if (conversation && conversation.participants.includes(socket.user._id)) {
                    socket.join(`dm-${conversationId}`);
                    console.log(`${socket.user.username} joined DM room dm-${conversationId}`);
                }
            } catch (error) {
                console.error("Join DM Room Error:", error);
            }
        });

        socket.on("leave-dm-room", (conversationId) => {
            socket.leave(`dm-${conversationId}`);
            console.log(`${socket.user.username} left DM room dm-${conversationId}`);
        });

        socket.on("leave-channel-room", (channelId) => {
            socket.leave(channelId);
            console.log(`${socket.user.username} left room ${channelId}`);
        });

        socket.on("typing-start", (data) => {
            const { conversationId, channelId } = data;
            const payload = {
                userId: socket.user._id,
                username: socket.user.username,
                avatar: socket.user.avatar,
                conversationId,
                channelId
            };

            if (conversationId) {
                socket.to(`dm-${conversationId}`).emit("typing-start", payload);
            } else if (channelId) {
                socket.to(channelId).emit("typing-start", payload);
            }
        });

        socket.on("typing-stop", (data) => {
            const { conversationId, channelId } = data;
            const payload = {
                userId: socket.user._id,
                conversationId,
                channelId
            };

            if (conversationId) {
                socket.to(`dm-${conversationId}`).emit("typing-stop", payload);
            } else if (channelId) {
                socket.to(channelId).emit("typing-stop", payload);
            }
        });

        socket.on("disconnect", () => {
            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                }
            }

            io.emit(
                "online-users",
                [...onlineUsers.keys()]
            );

            console.log(
                `[Presence] ${socket.user.username} disconnected`
            );
        });
    });
};

module.exports = registerSocketHandlers;