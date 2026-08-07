const { createMessageService } = require("../services/messageService");
const onlineUsers = require("./onlineUsers");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

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
                const message = await createMessageService(
                    data.content,
                    data.channelId,
                    socket.user._id
                );

                io.to(data.channelId).emit(
                    "receive-message",
                    message
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
                const { conversationId, content } = data;
                
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) return;

                const message = await Message.create({
                    content,
                    sender: socket.user._id,
                    channel: null,
                    conversation: conversation._id,
                });

                const populatedMessage = await message.populate("sender", "username avatar");

                conversation.lastMessagePreview = content;
                conversation.lastMessageAt = new Date();
                await conversation.save();

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