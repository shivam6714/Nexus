import api from "./api";

export const getOrCreateConversation = async (userId) => {
    const response = await api.post("/conversations", { userId });
    return response.data.conversation;
};

export const getConversations = async () => {
    const response = await api.get("/conversations");
    return response.data.conversations;
};