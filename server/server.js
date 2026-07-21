require("dotenv").config();
const socketAuth = require("./socket/socketAuth");
const http = require("http");
const { Server } = require("socket.io");
const registerSocketHandlers = require("./socket/socketHandler");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

io.use(socketAuth);

registerSocketHandlers(io);

const startServer = async () => {
    await connectDB();

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();