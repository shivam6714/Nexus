const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { 
    sendFriendRequest, 
    getFriendRequests, 
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriends
} = require("../controllers/friendController");

router.post("/request", protect, sendFriendRequest);
router.get("/requests", protect, getFriendRequests);
router.post("/accept/:requestId", protect, acceptFriendRequest);
router.post("/reject/:requestId", protect, rejectFriendRequest);
router.delete("/cancel/:requestId", protect, cancelFriendRequest);
router.delete("/remove/:friendId", protect, removeFriend);
router.get("/", protect, getFriends);

module.exports = router;
