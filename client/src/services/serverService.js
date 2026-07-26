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