const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { searchUsers } = require("../controllers/friendController");

router.get("/search", protect, searchUsers);

module.exports = router;
