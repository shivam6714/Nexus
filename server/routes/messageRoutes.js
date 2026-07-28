const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
    createMessage,
    getMessages,
    createDMMessage,
    getDMMessages,
} = require("../controllers/messageController");

router.post("/send", protect, createMessage);
router.post("/dm", protect, createDMMessage);
router.get("/dm/:conversationId", protect, getDMMessages);
router.get("/:channelId", protect, getMessages);

module.exports = router;