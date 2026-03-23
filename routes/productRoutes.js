import express from "express";
import multer from "multer";

// 👈 FIX 1: Import the BASE cloudinary module, not just v2
import cloudinaryModule from "cloudinary"; 
const cloudinary = cloudinaryModule.v2;

import pkg from "multer-storage-cloudinary"; 
const CloudinaryStorage = pkg.CloudinaryStorage || pkg; 

import "dotenv/config"; 

// --- Import Models & Controllers --- 
import { 
  getProducts,
  getProductById,
  addProduct, 
  deleteProduct, 
  updateProduct,
  toggleLike,
  addComment,
  addAdminReply,
  deleteComment,
  togglePinComment,
  getUserNotifications,
  markNotificationsRead,
  markSingleNotificationRead,
  deleteNotification,
  clearAllNotifications
} from "../controllers/productController.js";

const router = express.Router();

// --- CLOUDINARY CONFIGURATION ---
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// --- STORAGE SETUP ---
const storage = new CloudinaryStorage({
  // 👈 FIX 2: Pass the BASE module here so the library can safely call .v2 on it!
  cloudinary: cloudinaryModule, 
  params: {
    folder: 'tulasi_products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

// --- Core Product Routes ---
router.get("/", getProducts);
router.get("/:id", getProductById); 

// The 'upload.array' middleware handles the images BEFORE saving the product
router.post("/", upload.array("images", 5), addProduct);
router.put("/:id", upload.array("images", 5), updateProduct);
router.delete("/:id", deleteProduct);

// --- Notification Routes ---
router.get("/notifications/:userId", getUserNotifications); 
router.put("/notifications/:userId/read", markNotificationsRead);
router.put("/notifications/:userId/:notificationId/read", markSingleNotificationRead);
router.delete("/notifications/:userId/clear", clearAllNotifications); 
router.delete("/notifications/:userId/:notificationId", deleteNotification);

// --- Social / Comment Routes ---
router.post("/:id/like", toggleLike);
router.post("/:id/comments", addComment);
router.post("/:id/comments/:commentId/reply", addAdminReply);
router.delete("/:id/comments/:commentId", deleteComment); 
router.put("/:id/comments/:commentId/pin", togglePinComment); 

export default router;