import User from "../models/user.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

// -------------------- EMAIL TRANSPORTER --------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: "18sarusondj@gmail.com",
    pass: "nvyrsmbjvmkttiai",
  },
});

// -------------------- REGISTER --------------------
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp);

    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verifyOTP: otp,
      otpExpires,
    });

    await user.save();

    // Send email (background)
    transporter.sendMail({
      to: user.email,
      from: "18sarusondj@gmail.com",
      subject: "Your OTP for Tulasi Registration 🌿",
      html: `
        <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
          <h2>Hello ${user.name}</h2>
          <p>Your verification OTP:</p>
          <h1 style="letter-spacing:5px">${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
        </div>
      `,
    }).then(() => {
      console.log("📧 OTP email sent");
    }).catch(err => {
      console.error("❌ Email error:", err);
    });

    res.json({
      message: "User registered successfully. Check your email for OTP.",
      email: user.email,
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration error" });
  }
};

// -------------------- VERIFY OTP --------------------
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("Verify request:", email, otp);

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    console.log("DB OTP:", user.verifyOTP);

    // Check OTP exists
    if (!user.verifyOTP) {
      return res.status(400).json({ message: "No OTP found. Please register again." });
    }

    // Compare OTP safely
    if (user.verifyOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check expiration
    if (user.otpExpires && new Date() > user.otpExpires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.verifyOTP = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Email verified successfully!" });

  } catch (err) {
    console.error("OTP VERIFY ERROR:", err);
    res.status(500).json({ message: "OTP verification error" });
  }
};

// -------------------- LOGIN --------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.role !== "admin" && !user.isVerified)
      return res.status(403).json({ message: "Please verify your email to login" });

    if (!user.isActive)
      return res.status(403).json({ message: "Your account is deactivated" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login error" });
  }
};

// -------------------- FORGOT PASSWORD --------------------
export const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      from: "18sarusondj@gmail.com",
      subject: "Password Reset Request - Tulasi",
      html: `
        <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
          <h2>Password Reset</h2>
          <p>Click below to reset your password.</p>
          <a href="${resetUrl}" style="background:#22c55e;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            Reset Password
          </a>
        </div>
      `,
    });

    res.json({ message: "Password reset email sent" });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

// -------------------- RESET PASSWORD --------------------
export const resetPassword = async (req, res) => {
  try {

    const { password } = req.body;
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Reset error" });
  }
};