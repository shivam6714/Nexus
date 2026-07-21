const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const serverRoutes = require("./routes/serverRoutes");
const channelRoutes = require("./routes/channelRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/server", serverRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/message", messageRoutes);
app.get("/", (req, res) => {
    res.send("Nexus backend is running");
});

module.exports = app;