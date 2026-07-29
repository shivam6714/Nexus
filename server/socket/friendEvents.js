const onlineUsers = require("./onlineUsers");

const emitToUser = (io, userId, event, payload) => {
    const sockets = onlineUsers.get(userId.toString());
    if (sockets) {
        sockets.forEach((socketId) => io.to(socketId).emit(event, payload));
    }
};

const emitFriendRequest = (io, receiverId, request) => {
    emitToUser(io, receiverId, "friend:request", request);
};

const emitFriendAccepted = (io, senderId, request) => {
    emitToUser(io, senderId, "friend:accepted", request);
};

const emitFriendRejected = (io, senderId, request) => {
    emitToUser(io, senderId, "friend:rejected", request);
};

const emitFriendCancelled = (io, receiverId, request) => {
    emitToUser(io, receiverId, "friend:cancelled", request);
};

const emitFriendRemoved = (io, removedFriendId, payload) => {
    emitToUser(io, removedFriendId, "friend:removed", payload);
};

module.exports = {
    emitFriendRequest,
    emitFriendAccepted,
    emitFriendRejected,
    emitFriendCancelled,
    emitFriendRemoved
};
