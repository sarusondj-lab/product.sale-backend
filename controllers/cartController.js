import Cart from "../models/cart.js";

// Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    // If no cart exists, return empty items array so frontend doesn't crash
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { userId, product } = req.body;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existing = cart.items.find(
      (item) => item.productId.toString() === product.productId
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push(product);
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};

// Update item quantity (+ and - buttons)
export const updateQuantity = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    // Validation: Don't allow quantity less than 1
    if (quantity < 1) {
        return res.status(400).json({ message: "Quantity cannot be less than 1" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.productId.toString() === productId
    );

    if (item) {
      item.quantity = quantity;
      // markModified tells Mongoose to update the array inside the document
      cart.markModified('items'); 
      await cart.save();
      
      // Return the updated items array so the frontend state updates correctly
      return res.json({ items: cart.items });
    }

    res.status(404).json({ message: "Product not found in cart" });
  } catch (error) {
    res.status(500).json({ message: "Error updating quantity", error: error.message });
  }
};

// Remove single item from cart
export const removeItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    // Direct removal using MongoDB $pull
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: productId } } },
      { new: true }
    );

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: "Error removing item", error: error.message });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Cart.findOneAndDelete({ userId });
    
    res.status(200).json({ message: "Cart cleared successfully", items: [] });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};