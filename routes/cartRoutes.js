import express from "express";
import { 
  getCart, 
  addToCart, 
  clearCart, 
  removeItem, 
  updateQuantity // Added this import
} from "../controllers/cartController.js";

const router = express.Router();

// GET cart for a specific user
router.get("/:userId", getCart);

// ADD new item
router.post("/add", addToCart);

// UPDATE quantity (Crucial for + and - buttons)
// This matches your frontend call: /api/cart/:userId/:productId
router.patch("/:userId/:productId", updateQuantity); 

// REMOVE a single item
router.delete("/:userId/:productId", removeItem); 

// CLEAR the whole cart
router.delete("/:userId", clearCart);

export default router;