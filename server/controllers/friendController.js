const friendService = require("../services/friendService");
const { 
    emitFriendRequest, 
    emitFriendAccepted, 
    emitFriendRejected, 
    emitFriendCancelled, 
    emitFriendRemoved 
} = require("../socket/friendEvents");

const sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user._id;

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: "Receiver ID is required",
            });
        }

        const request = await friendService.sendFriendRequest(senderId, receiverId);

        emitFriendRequest(req.app.get("io"), receiverId, request);

        res.status(201).json({
            success: true,
            message: "Friend request sent successfully.",
            request,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await friendService.getFriendRequests(userId);

        res.status(200).json({
            success: true,
            ...requests,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await friendService.acceptFriendRequest(requestId, userId);

        emitFriendAccepted(req.app.get("io"), request.sender, request);

        res.status(200).json({
            success: true,
            message: "Friend request accepted successfully.",
            request,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await friendService.rejectFriendRequest(requestId, userId);

        emitFriendRejected(req.app.get("io"), request.sender, request);

        res.status(200).json({
            success: true,
            message: "Friend request rejected successfully.",
            request,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const cancelFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const { request } = await friendService.cancelFriendRequest(requestId, userId);

        emitFriendCancelled(req.app.get("io"), request.receiver, request);

        res.status(200).json({
            success: true,
            message: "Friend request cancelled successfully.",
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user._id;

        await friendService.removeFriend(userId, friendId);

        emitFriendRemoved(req.app.get("io"), friendId, { userId, friendId });

        res.status(200).json({
            success: true,
            message: "Friend removed successfully.",
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;

        const friends = await friendService.getFriends(userId);

        res.status(200).json({
            success: true,
            friends,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user._id;

        const users = await friendService.searchUsers(query, userId);

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriends,
    searchUsers,
};
