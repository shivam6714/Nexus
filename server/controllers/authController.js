const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");


const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(201).json({
            success: true,
            message: "User registered sucessfully",
            user,
        });

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const token =jwt.sign(
            {
                id:user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7D",
            }
        );

        res.status(200).json({
            success: true,
            message:"login successful",
            token,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
                avatar:user.avatar,
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
module.exports = {
    register,
    login,
};