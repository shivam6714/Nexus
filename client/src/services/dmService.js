import api from "./api";

export const sendDM = async (conversationId, content) => {
    const response = await api.post("/message/dm", { conversationId, content });
    return response.data.data;
};

export const getDMMessages = async (conversationId) => {
    const response = await api.get(`/message/dm/${conversationId}`);
    return response.data.messages;
};
