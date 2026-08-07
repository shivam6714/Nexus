import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer test_token`;
    return config;
});

console.log("Headers before request:", api.defaults.headers);
api.get("/server").catch(e => {
    console.log("Request headers sent:", e.config.headers);
});
