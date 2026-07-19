const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { createServer } = require("../controllers/serverController");

router.post("/create", protect, createServer);
module.exports = router;