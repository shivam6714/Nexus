import api from "./api";

export const getFriends = async () => {
    const response = await api.get("/friends");
    return response.data;
};

export const getFriendRequests = async () => {
    const response = await api.get("/friends/requests");
    return response.data;
};

export const searchUsers = async (query) => {
    const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
};

export const sendFriendRequest = async (receiverId) => {
    const response = await api.post("/friends/request", { receiverId });
    return response.data;
};

export const acceptFriendRequest = async (requestId) => {
    const response = await api.post(`/friends/accept/${requestId}`);
    return response.data;
};

export const rejectFriendRequest = async (requestId) => {
    const response = await api.post(`/friends/reject/${requestId}`);
    return response.data;
};

export const cancelFriendRequest = async (requestId) => {
    const response = await api.delete(`/friends/cancel/${requestId}`);
    return response.data;
};

export const removeFriend = async (friendId) => {
    const response = await api.delete(`/friends/remove/${friendId}`);
    return response.data;
};
