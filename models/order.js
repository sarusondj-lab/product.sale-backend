import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone1: { type: String, required: true },
  phone2: { type: String }, // For the backup contact
  fullAddress: { type: String, required: true },
  items: Array,
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

// This tells Mongoose: "Use the existing Order model, or create a new one if it doesn't exist."
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;