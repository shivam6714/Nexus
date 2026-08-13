const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/image", (req, res) => {
    upload.single("image")(req, res, function (err) {
        if (err) {
            // Handle multer errors
            return res.status(400).json({
                message: err.message || "File upload failed",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Image is required",
            });
        }

        // Return the path
        const imageUrl = req.file.secure_url || req.file.url || req.file.path;
        
        return res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: imageUrl,
        });
    });
});

module.exports = router;
