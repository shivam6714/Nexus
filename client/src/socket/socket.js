import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
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