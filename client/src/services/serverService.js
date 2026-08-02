import api from "./api";

export const createServer = async (serverData) => {
    const response = await api.post("/server/create", serverData);
    return response.data;
};

export const getMyServers = async () => {
    const response = await api.get("/server/my-servers");
    return response.data;
};
export const uploadServerIcon = async (serverId, file) => {
    const formData = new FormData();

    formData.append("icon", file);

    const response = await api.put(
        `/server/${serverId}/icon`,
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
    const response = await api.get(`/server/${serverId}/info`);
    return response.data;
};

export const leaveServer = async (serverId) => {
    const response = await api.post(`/server/${serverId}/leave`);
    return response.data;
};

export const transferAndLeaveServer = async (serverId, newOwnerId) => {
    const response = await api.post(`/server/${serverId}/transfer-leave`, { newOwnerId });
    return response.data;
};

export const deleteServer = async (serverId) => {
    const response = await api.delete(`/server/${serverId}`);
    return response.data;
};

export const renameServer = async (serverId, name) => {
    const response = await api.put(`/server/${serverId}/rename`, { name });
    return response.data;
};