const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const serverRoutes = require("./routes/serverRoutes");
const channelRoutes = require("./routes/channelRoutes");
const messageRoutes = require("./routes/messageRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const friendRoutes = require("./routes/friendRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);
app.use("/api/auth", authRoutes);
app.use("/api/server", serverRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
    res.send("Nexus backend is running");
});

app.get("/api/debug", (req, res) => {
    res.json({
        secretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        secretPrefix: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) : "none"
    });
});

module.exports = app;