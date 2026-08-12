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
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // Allow Vercel preview domains and localhost for development
        // Allow the exact configured CLIENT_URL
        if (!origin || origin.endsWith(".vercel.app") || origin.includes("localhost") || origin === process.env.CLIENT_URL) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
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



module.exports = app;