const emitServerUpdated = (io, serverId, server) => {
    io.to(`server-${serverId}`).emit("server-updated", { server });
};

const emitMemberLeft = (io, serverId, userId) => {
    io.to(`server-${serverId}`).emit("server-member-left", { serverId, userId });
};

const emitOwnerTransferred = (io, serverId, newOwnerId) => {
    io.to(`server-${serverId}`).emit("server-owner-changed", { serverId, newOwnerId });
};

const emitServerDeleted = (io, serverId) => {
    io.to(`server-${serverId}`).emit("server-deleted", { serverId });
};

const emitMemberJoined = (io, serverId, user) => {
    io.to(`server-${serverId}`).emit("server-member-joined", { serverId, user });
};

module.exports = {
    emitServerUpdated,
    emitMemberLeft,
    emitOwnerTransferred,
    emitServerDeleted,
    emitMemberJoined
};
