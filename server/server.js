require("dotenv").config();
const socketAuth = require("./socket/socketAuth");
const http = require("http");
const { Server } = require("socket.io");
const registerSocketHandlers = require("./socket/socketHandler");
const path = require("path");
const app = require("./app");
const connectDB = require("./config/db");
const express = require("express");
const uploadRoutes = require("./routes/uploadRoutes");

const PORT = process.env.PORT || 5000;

app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            // Allow Vercel preview domains and localhost for development
            // Allow the exact configured CLIENT_URL
            if (!origin || origin.endsWith(".vercel.app") || origin.includes("localhost") || origin === process.env.CLIENT_URL) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.use(socketAuth);

app.set("io", io);

registerSocketHandlers(io);

const startServer = async () => {
    await connectDB();

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();