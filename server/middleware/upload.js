const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload folders exist
const avatarDir = path.join(__dirname, "../uploads/avatars");
const serverIconDir = path.join(__dirname, "../uploads/server-icons");
const messageDir = path.join(__dirname, "../uploads/messages");

fs.mkdirSync(avatarDir, { recursive: true });
fs.mkdirSync(serverIconDir, { recursive: true });
fs.mkdirSync(messageDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (req.baseUrl.includes("auth")) {
            cb(null, avatarDir);
        } else if (req.baseUrl.includes("upload") || req.originalUrl.includes("upload")) {
            cb(null, messageDir);
        } else {
            cb(null, serverIconDir);
        }
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueName + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type. Only JPEG, PNG, and WEBP are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = upload;