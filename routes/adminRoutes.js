import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js"; // Assuming you have a User model
import checkDiskSpace from "check-disk-space"; // Install this: npm install check-disk-space

const router = express.Router();

// 1. DASHBOARD STATS
router.get("/stats", async (req, res) => {
  try {
    const [userCount, productCount, orderCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments()
    ]);
    res.json({ totalUsers: userCount, totalProducts: productCount, totalOrders: orderCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. STORAGE MONITORING
router.get("/storage", async (req, res) => {
  try {
    // Checks the space on your C: drive or current root
    const space = await checkDiskSpace('C:/'); 
    res.json({
      size: Math.round(space.size / 1024 / 1024 / 1024), // GB
      free: Math.round(space.free / 1024 / 1024 / 1024)  // GB
    });
  } catch (err) {
    res.json({ size: 100, free: 80 }); // Fallback data
  }
});

// 3. PRODUCT MANAGEMENT
router.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.status(201).json(newProduct);
});

router.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// 4. ORDER MANAGEMENT
router.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

export default router;