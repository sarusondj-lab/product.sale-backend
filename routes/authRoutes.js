import express from "express";
import {
  register,
  verifyOTP,       // ✅ import the new OTP function
  login,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";

const router = express.Router();

// -------------------- Public Routes --------------------
router.post("/register", register);

// OTP verification route
router.post("/verify-otp", verifyOTP);

// Login route
router.post("/login", login);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password/:token", resetPassword);

export default router;