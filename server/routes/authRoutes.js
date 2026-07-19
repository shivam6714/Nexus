const express = require("express");
const protect = require("../middleware/authMiddleware")
const{ register,login,getProfile } = require("../controllers/authController")
const router =express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/profile",protect,getProfile);

module.exports=router;