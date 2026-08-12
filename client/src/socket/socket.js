import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
});

let token = localStorage.getItem("token");
if (token) {
    token = token.replace(/^"(.*)"$/, '$1');
}

socket.auth = {
    token: token,
};

export default socket;  