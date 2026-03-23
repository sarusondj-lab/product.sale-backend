import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import checkDiskSpace from "check-disk-space";
import multer from "multer";
import fs from "fs";
import axios from "axios";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Model Import
import Product from "./models/product.js";

const app = express();

// ---------------- 1. MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());

// Serve the uploads folder so images can be accessed by frontend
app.use("/uploads", express.static("uploads"));

// ---------------- 2. FILE SYSTEM SETUP ----------------
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ---------------- 3. MULTER CONFIGURATION ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ---------------- 4. BACKEND TRANSLATION HELPER ----------------
const translateText = async (text, targetLang) => {
  if (!text || text.trim() === "") return "";

  try {
    const res = await axios.post(
      "https://libretranslate.de/translate",
      {
        q: text,
        source: "en",
        target: targetLang,
        format: "text",
        api_key: "",
      },
      { timeout: 8000 }
    );
    return res.data.translatedText;
  } catch (err) {
    console.error(
      `⚠️ Translation to ${targetLang} failed. Using English fallback.`,
      err.message
    );
    return text;
  }
};

// ---------------- 5. MONGODB CONNECTION ----------------
mongoose
  .connect("mongodb://127.0.0.1:27017/tulasi")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------------- 6. API ENDPOINTS ----------------

// Storage Monitor for Admin Dashboard
app.get("/api/storage", async (req, res) => {
  try {
    const pathName = process.platform === "win32" ? "C:/" : "/";
    const diskSpace = await checkDiskSpace(pathName);
    res.json({
      free: Math.round(diskSpace.free / 1e9),
      size: Math.round(diskSpace.size / 1e9),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching storage info" });
  }
});

// Full Product Upload with Gallery & Auto-Translation
app.post("/api/products/add-with-gallery", upload.array("images", 5), async (req, res) => {
  try {
    const { name, price, description } = req.body;

    if (!name || !price)
      return res.status(400).json({ message: "Name and Price are required" });

    // Store relative image paths instead of URLs
    const images = req.files ? req.files.map(file => `uploads/${file.filename}`) : [];

    // Trigger auto-translations
    const [descriptionHindi, descriptionKannada] = await Promise.all([
      translateText(description, "hi"),
      translateText(description, "kn"),
    ]);

    const newProduct = new Product({
      name,
      price: Number(price),
      description,
      descriptionHindi,
      descriptionKannada,
      images,
    });

    const savedProduct = await newProduct.save();

    console.log("✅ Product Created and Saved:", savedProduct._id);
    res.status(201).json({ message: "Product added successfully", product: savedProduct });
  } catch (err) {
    console.error("❌ Error at POST /add-with-gallery:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// ---------------- 7. STANDARD API ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// ---------------- 8. SERVER START ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});