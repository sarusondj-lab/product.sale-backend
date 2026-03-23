import express from "express";

import {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder
} from "../controllers/orderController.js";

const router = express.Router();

// CREATE ORDER
router.post("/", createOrder);

// GET ALL ORDERS
router.get("/", getOrders);

// UPDATE ORDER STATUS
router.patch("/:id", updateOrderStatus);

// DELETE ORDER
router.delete("/:id", deleteOrder);

export default router;