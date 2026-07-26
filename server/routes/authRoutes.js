const express = require("express");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
    register,
    login,
    getProfile,
    uploadAvatar,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put(
    "/profile/avatar",
    protect,
    upload.single("avatar"),
    uploadAvatar
);

module.exports = router;