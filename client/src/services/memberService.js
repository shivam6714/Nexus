import api from "./api";

export const getServerMembers = async (serverId) => {
    const response = await api.get(`/server/${serverId}/members`);

    return response.data;
};