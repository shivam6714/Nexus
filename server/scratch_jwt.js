require("dotenv").config();
const jwt = require("jsonwebtoken");

console.log("JWT_SECRET:", process.env.JWT_SECRET);

const mockUser = { _id: "64a0f44358a9e0a4f5b5c3e0" };
const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

console.log("Generated Token:", token);

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);
} catch (e) {
    console.error("Verify Error:", e.message);
}
