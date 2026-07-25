const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
    createServer,
    getMyServers,
    joinServer,
} = require("../controllers/serverController");
router.get("/", protect, getMyServers);
router.post("/create", protect, createServer);
router.post("/join", protect, joinServer);
module.exports = router;