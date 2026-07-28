import axios from "axios";

const API_URL = "http://localhost:5000/api/message/dm";
export const sendDM = async (conversationId, content) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        API_URL,
        { conversationId, content },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data.data;
};

export const getDMMessages = async (conversationId) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/${conversationId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data.messages;
};
