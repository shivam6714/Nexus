const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { createServer,getMyServers } = require("../controllers/serverController");
router.get("/",protect,getMyServers);
router.post("/create", protect, createServer);
module.exports = router;