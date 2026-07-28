const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
    getOrCreateConversation,
} = require("../controllers/conversationController");

router.post("/", protect, getOrCreateConversation);


module.exports = router;