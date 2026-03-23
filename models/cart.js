import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  items: [
    {
      productId: String,

      name: String,

      price: Number,

      image: String,

      quantity: Number
    }
  ]

});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;