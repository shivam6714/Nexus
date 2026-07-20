const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { createChannel } = require("../controllers/channelController");

router.post("/create", protect, createChannel);

module.exports = router;