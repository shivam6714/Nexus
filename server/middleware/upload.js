const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine the folder based on the route
        let folderName = "nexus_general";
        if (req.baseUrl.includes("auth")) {
            folderName = "nexus_avatars";
        } else if (req.baseUrl.includes("upload") || req.originalUrl.includes("upload")) {
            folderName = "nexus_messages";
        } else {
            folderName = "nexus_server_icons";
        }

        return {
            folder: folderName,
            allowed_formats: ["png", "jpeg", "jpg", "webp"],
            public_id: file.fieldname + "-" + Date.now() + "-" + Math.round(Math.random() * 1e9),
        };
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