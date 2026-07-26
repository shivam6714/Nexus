const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
    createServer,
    getMyServers,
    joinServer,
    getServerMembers,
    uploadServerIcon,
} = require("../controllers/serverController");
router.get("/", protect, getMyServers);
router.post("/create", protect, createServer);
router.post("/join", protect, joinServer);
router.get(
    "/:serverId/members",
    protect,
    getServerMembers
);
router.put(
    "/:serverId/icon",
    protect,
    upload.single("icon"),
    uploadServerIcon
);
module.exports = router;