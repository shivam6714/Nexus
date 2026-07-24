import api from "./api";

export const createChannel = async (channelData) => {
    const response = await api.post("/channel/create", channelData);
    return response.data;
};