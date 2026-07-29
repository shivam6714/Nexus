const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");

const sendFriendRequest = async (senderId, receiverId) => {
    // 1. Sender and receiver cannot be the same user
    if (senderId.toString() === receiverId.toString()) {
        throw new Error("You cannot send a friend request to yourself.");
    }

    // 2. Receiver must exist
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        throw new Error("User not found.");
    }

    // 3. Users cannot send requests to existing friends
    const isAlreadyFriend = receiver.friends.some((friendId) => friendId.equals(senderId));
    if (isAlreadyFriend) {
        throw new Error("You are already friends with this user.");
    }

    // 4. Users cannot send duplicate pending friend requests in either direction
    const existingRequest = await FriendRequest.findOne({
        $or: [
            { sender: senderId, receiver: receiverId, status: "pending" },
            { sender: receiverId, receiver: senderId, status: "pending" }
        ]
    });

    if (existingRequest) {
        throw new Error("A pending friend request already exists between you and this user.");
    }

    // 5. Create a new FriendRequest
    const newRequest = await FriendRequest.create({
        sender: senderId,
        receiver: receiverId,
        status: "pending",
    });

    // 6. Return the created request
    return newRequest;
};

const acceptFriendRequest = async (requestId, userId) => {
    // 1. Find the FriendRequest by requestId
    const request = await FriendRequest.findById(requestId);
    if (!request) {
        throw new Error("Friend request not found.");
    }

    // 2 & 3. Ensure status is pending
    if (request.status !== "pending") {
        throw new Error("This friend request is no longer pending.");
    }

    // 4. Ensure only the receiver can accept the request
    if (request.receiver.toString() !== userId.toString()) {
        throw new Error("You are not authorized to accept this request.");
    }

    // 5. Add both users to each other's friends list safely using $addToSet
    await Promise.all([
        User.findByIdAndUpdate(request.sender, {
            $addToSet: { friends: request.receiver }
        }),
        User.findByIdAndUpdate(request.receiver, {
            $addToSet: { friends: request.sender }
        })
    ]);

    // 6 & 7. Update the FriendRequest status and save
    request.status = "accepted";
    await request.save();

    // 8. Return the updated request
    return request;
};

const rejectFriendRequest = async (requestId, userId) => {
    // 1. Find the FriendRequest by requestId
    const request = await FriendRequest.findById(requestId);
    if (!request) {
        throw new Error("Friend request not found.");
    }

    // 2 & 3. Ensure status is pending
    if (request.status !== "pending") {
        throw new Error("This friend request is no longer pending.");
    }

    // 4. Ensure only the receiver can reject the request
    if (request.receiver.toString() !== userId.toString()) {
        throw new Error("You are not authorized to reject this request.");
    }

    // 5 & 6. Update status to rejected and save
    request.status = "rejected";
    await request.save();

    // 7. Return the updated request
    return request;
};

const cancelFriendRequest = async (requestId, userId) => {
    // 1 & 2. Find the FriendRequest and ensure it exists
    const request = await FriendRequest.findById(requestId);
    if (!request) {
        throw new Error("Friend request not found.");
    }

    // 3. Ensure status is "pending"
    if (request.status !== "pending") {
        throw new Error("Only pending friend requests can be canceled.");
    }

    // 4. Ensure ONLY the sender can cancel
    if (request.sender.toString() !== userId.toString()) {
        throw new Error("You are not authorized to cancel this request.");
    }

    // 5. Delete the FriendRequest document
    await FriendRequest.findByIdAndDelete(requestId);

    // 6. Return success
    return { success: true };
};

const removeFriend = async (userId, friendId) => {
    // 1. Verify both users exist
    const [user, friend] = await Promise.all([
        User.findById(userId),
        User.findById(friendId)
    ]);

    if (!user || !friend) {
        throw new Error("One or both users not found.");
    }

    // 2, 3, & 4. Remove each user from the other's friends array safely using $pull concurrently
    await Promise.all([
        User.findByIdAndUpdate(userId, {
            $pull: { friends: friendId }
        }),
        User.findByIdAndUpdate(friendId, {
            $pull: { friends: userId }
        })
    ]);

    // 5. Return success
    return { success: true };
};

const getFriends = async (userId) => {
    // Fetch user and populate the friends array with username and avatar
    const user = await User.findById(userId).populate("friends", "username avatar");
    
    if (!user) {
        throw new Error("User not found.");
    }

    // Return only the populated friends array
    return user.friends;
};

const getFriendRequests = async (userId) => {
    const [incomingRequests, outgoingRequests] = await Promise.all([
        FriendRequest.find({
            receiver: userId,
            status: "pending",
        }).populate("sender", "username avatar"),
        FriendRequest.find({
            sender: userId,
            status: "pending",
        }).populate("receiver", "username avatar")
    ]);

    return {
        incomingRequests,
        outgoingRequests,
    };
};

const searchUsers = async (query, userId) => {
    // 1. Fetch current user to get their friends array
    const currentUser = await User.findById(userId).select("friends");
    if (!currentUser) {
        throw new Error("User not found.");
    }

    // 2. Find all pending requests involving the current user (both incoming and outgoing)
    const pendingRequests = await FriendRequest.find({
        $or: [
            { sender: userId, status: "pending" },
            { receiver: userId, status: "pending" }
        ]
    }).select("sender receiver");

    // Extract the IDs of the other users involved in those pending requests
    const pendingUserIds = pendingRequests.map(req => 
        req.sender.toString() === userId.toString() ? req.receiver : req.sender
    );

    // Combine all IDs to exclude: the user themselves, their friends, and users with pending requests
    const excludedIds = [
        userId,
        ...currentUser.friends,
        ...pendingUserIds
    ];

    // 3. Query the User collection for eligible users matching the string
    const eligibleUsers = await User.find({
        username: { $regex: query, $options: "i" }, // case-insensitive match
        _id: { $nin: excludedIds } // exclude all restricted IDs
    }).select("_id username avatar"); // select only safe, necessary fields

    return eligibleUsers;
};

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriends,
    getFriendRequests,
    searchUsers,
};
