import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
    let token = localStorage.getItem("token");

    if (token) {
        token = token.replace(/^"(.*)"$/, '$1'); // Strip quotes if they exist
        config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
});

export default api;