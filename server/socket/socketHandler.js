const { createMessageService } = require("../services/messageService");
const onlineUsers = require("./onlineUsers");

const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("Authenticated user:", socket.user.username);

      
        const userId = socket.user._id.toString();

        onlineUsers.set(userId, socket.id);

        io.emit(
            "online-users",
            [...onlineUsers.keys()]
        );

        console.log(
            `[Presence] ${socket.user.username} connected`
        );

        socket.on("join-room", (channelId) => {
            socket.join(channelId);

            console.log(
                `${socket.user.username} joined room ${channelId}`
            );
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

      
        socket.on("disconnect", () => {
            onlineUsers.delete(userId);

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