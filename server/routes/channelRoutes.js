const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { createChannel,getChannels } = require("../controllers/channelController");

router.post("/create", protect, createChannel);
router.get("/:serverId", protect, getChannels);

module.exports = router;