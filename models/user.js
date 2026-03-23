import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      default: "user"
    },

    // account status
    isActive: {
      type: Boolean,
      default: true
    },

    // email verification
    isVerified: {
      type: Boolean,
      default: false
    },

    // ✅ OTP fields (IMPORTANT)
    verifyOTP: {
      type: String
    },

    otpExpires: {
      type: Date
    },

    lastLogin: {
      type: Date,
      default: Date.now
    },

    // password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // --- NEW: NOTIFICATIONS ARRAY ---
    notifications: [{
      message: String,
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;