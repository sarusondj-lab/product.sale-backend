import express from "express";
import { 
  getUsers, 
  toggleUserStatus, 
  deleteUser 
} from "../controllers/userController.js";

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Fetch all users for the Admin Dashboard (excluding passwords)
 * @access  Private/Admin
 */
router.get("/", getUsers);

/**
 * @route   PUT /api/users/toggle/:id
 * @desc    Toggle user status (isActive) and send deactivation email
 * @access  Private/Admin
 */
router.put("/toggle/:id", toggleUserStatus);

/**
 * @route   DELETE /api/users/:id
 * @desc    Remove a user from the Tulasi database
 * @access  Private/Admin
 */
router.delete("/:id", deleteUser);

export default router;