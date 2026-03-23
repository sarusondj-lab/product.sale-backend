// 1. Load Environment Variables First!
import "dotenv/config"; 

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// 2. Import all your specific routes
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Allows frontend to talk to backend

// FIX: Increased payload limit to 50mb to prevent 'Connection Reset' errors during image uploads
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- ROUTES ---
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

// --- DATABASE CONNECTION ---
// Make sure MONGO_URI is in your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB Atlas!"))
  .catch((error) => console.log("❌ MongoDB connection failed:", error.message));

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});