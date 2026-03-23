import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true },
    price: { type: Number, required: [true, "Price is required"] },
    images: { type: [String], default: [] },
    description: { type: String, required: [true, "Description is required"] },
    
    // --- TRANSLATION FIELDS ---
    descriptionHindi: { type: String, default: "" },
    descriptionKannada: { type: String, default: "" },
    
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    comments: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: { type: String, required: true },
      text: { type: String, required: true },
      adminReply: { type: String, default: null },
      isPinned: { type: Boolean, default: false }, // <--- NEW PIN FIELD
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;

