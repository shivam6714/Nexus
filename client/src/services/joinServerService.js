import api from "./api";

export const joinServer = async (inviteCode) => {
    const response = await api.post("/server/join", {
        inviteCode,
    });

    return response.data;
};