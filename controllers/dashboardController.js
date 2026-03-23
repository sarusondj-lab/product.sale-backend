import User from ("../models/user.js");
import Product from "../models/product.js"; // Ensure you have a Product model
import Order from "../models/order.js";     // Ensure you have an Order model

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      storageUsed: 0 // You can calculate this later if needed
    });
  } catch (err) {
    console.error("❌ Dashboard Stats Error:", err);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};