const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require("multer-storage-cloudinary"); 
const cloudinary = require("../config/cloudinary"); // Path to your Cloudinary config

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "user_images", // Store in "user_profiles" folder on Cloudinary
        format: async (req, file) => file.mimetype.split("/")[1], // Keep original image format
        public_id: (req, file) => file.originalname.split(".")[0], // Use original filename
    },
});

// Multer middleware
const upload = multer({ storage });

module.exports = upload;
