import User from "../models/user.js";
import nodemailer from "nodemailer";

// -------------------- EMAIL CONFIGURATION --------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "18sarusondj@gmail.com", 
    pass: "lmdvdabctpgpsxsl", 
  },
});

// -------------------- GET ALL USERS --------------------
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    // Compute inactiveDays for each user
    const now = new Date();
    const usersWithInactiveDays = users.map((user) => {
      let inactiveDays = null;
      if (user.lastLogin) {
        const diffMs = now - new Date(user.lastLogin);
        inactiveDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // convert ms to days
      }
      return {
        ...user.toObject(),
        inactiveDays,
      };
    });

    res.json(usersWithInactiveDays);
  } catch (err) {
    console.error("❌ Get Users Error:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// -------------------- TOGGLE USER STATUS (Activate/Deactivate + Email) --------------------
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    user.status = user.isActive ? "active" : "deactivated"; 
    
    await user.save();
    
    console.log(`👤 User ${user.email} is now ${user.isActive ? 'ACTIVE' : 'INACTIVE'}`);

    // Send email only if deactivated
    if (!user.isActive) {
      const mailOptions = {
        from: '"Tulasi Admin" <18sarusondj@gmail.com>',
        to: user.email,
        subject: "Account Deactivation - Tulasi 🌿",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #16a34a;">Hello ${user.name},</h2>
            <p style="color: #475569; line-height: 1.6;">Your Tulasi account has been deactivated by the administrator.</p>
            <p style="color: #475569; line-height: 1.6;">To reactivate your account, please click the button below to notify the Admin:</p>
            <div style="text-align: center; margin-top: 25px;">
              <a href="mailto:18sarusondj@gmail.com?subject=Reactivate: ${user.email}&body=Hi Admin, please reactivate my account for ${user.email}." 
                 style="background: #16a34a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                 Request Activation
              </a>
            </div>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error("❌ NODEMAILER ERROR:", error.message);
        else console.log("📧 EMAIL SENT SUCCESSFULLY:", info.response);
      });
    }

    return res.status(200).json({ 
      message: `User ${user.isActive ? "Activated" : "Deactivated"} Successfully`, 
      isActive: user.isActive 
    });

  } catch (err) {
    console.error("❌ TOGGLE ERROR:", err);
    res.status(500).json({ message: "Server error updating status" });
  }
};

// -------------------- DELETE USER --------------------
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted from Tulasi database" });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};