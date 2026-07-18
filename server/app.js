const express = require("express");
const authRoutes = require("./routes/authRoutes")
const app = express();

app.use(express.json());

app.use("/api/auth",authRoutes);
app.get("/", (req, res) => {
    res.send("Nexus backend is running");
});

module.exports = app;