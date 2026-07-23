import api from "./api";

export const createServer = async (serverData) => {
    const response = await api.post("/server/create", serverData);
    return response.data;
};

export const getMyServers = async () => {
    const response = await api.get("/server/my-servers");
    return response.data;
};