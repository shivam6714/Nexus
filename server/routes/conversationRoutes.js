const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
    getOrCreateConversation,
    getConversations,
} = require("../controllers/conversationController");

router.post("/", protect, getOrCreateConversation);
router.get("/", protect, getConversations);
module.exports = router;