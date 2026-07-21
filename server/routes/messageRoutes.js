const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
    createMessage,
    getMessages,
} = require("../controllers/messageController");

router.post("/send", protect, createMessage);
router.get("/:channelId", protect, getMessages);

module.exports = router;