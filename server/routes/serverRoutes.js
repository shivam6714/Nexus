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
    getServerInfo,
    leaveServer,
    transferAndLeave,
    deleteServer,
    renameServer,
} = require("../controllers/serverController");
router.get("/", protect, getMyServers);
router.post("/create", protect, createServer);
router.post("/join", protect, joinServer);
router.get(
    "/:serverId/members",
    protect,
    getServerMembers
);
router.get(
    "/:serverId/info",
    protect,
    getServerInfo
);
router.post(
    "/:serverId/leave",
    protect,
    leaveServer
);
router.post(
    "/:serverId/transfer-leave",
    protect,
    transferAndLeave
);
router.delete(
    "/:serverId",
    protect,
    deleteServer
);
router.put(
    "/:serverId/icon",
    protect,
    upload.single("icon"),
    uploadServerIcon
);
router.put(
    "/:serverId/rename",
    protect,
    renameServer
);
module.exports = router;