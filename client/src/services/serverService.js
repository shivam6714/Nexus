import api from "./api";

export const createServer = async (serverData) => {
    const response = await api.post(`${import.meta.env.VITE_API_URL}/api/server/create`, serverData);
    return response.data;
};

export const getMyServers = async () => {
    const response = await api.get(`${import.meta.env.VITE_API_URL}/api/server/my-servers`);
    return response.data;
};
export const uploadServerIcon = async (serverId, file) => {
    const formData = new FormData();

    formData.append("icon", file);

    const response = await api.put(
        `${import.meta.env.VITE_API_URL}/api/server/${serverId}/icon`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

export const getServerInfo = async (serverId) => {
    const response = await api.get(`${import.meta.env.VITE_API_URL}/api/server/${serverId}/info`);
    return response.data;
};

export const leaveServer = async (serverId) => {
    const response = await api.post(`${import.meta.env.VITE_API_URL}/api/server/${serverId}/leave`);
    return response.data;
};

export const transferAndLeaveServer = async (serverId, newOwnerId) => {
    const response = await api.post(`${import.meta.env.VITE_API_URL}/api/server/${serverId}/transfer-leave`, { newOwnerId });
    return response.data;
};

export const deleteServer = async (serverId) => {
    const response = await api.delete(`${import.meta.env.VITE_API_URL}/api/server/${serverId}`);
    return response.data;
};

export const renameServer = async (serverId, name) => {
    const response = await api.put(`${import.meta.env.VITE_API_URL}/api/server/${serverId}/rename`, { name });
    return response.data;
};