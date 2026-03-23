import cloudinaryModule from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import "dotenv/config"; // Ensure it reads the .env file

// Use the v2 object for configuration
const cloudinary = cloudinaryModule.v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Set up the storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryModule, // 👈 FIX: Passing the base module so it can find .v2 inside it!
  params: {
    folder: "tulasi_products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// Create the multer upload middleware
const upload = multer({ storage });

export default upload;