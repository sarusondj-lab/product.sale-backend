import Order from "../models/order.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    // We spread req.body to ensure fields like phone1 and phone2 are captured
    const order = new Order({
      ...req.body
    });

    const savedOrder = await order.save();

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Order Creation Error:", err);
    res.status(500).json({ 
      message: "Error saving order", 
      error: err.message 
    });
  }
};

// GET ALL ORDERS (Sorted by newest first)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Fetch Orders Error:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// UPDATE ORDER STATUS (e.g., Pending to Delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Error updating order" });
  }
};

// DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete Order Error:", err);
    res.status(500).json({ message: "Error deleting order" });
  }
};