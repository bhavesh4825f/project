import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};

// ✅ Get all users (with search)
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const search = req.query.search || "";
    const query = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { mno: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(query).select("-password");
    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Add new user
router.post("/users", protect, adminOnly, async (req, res) => {
  try {
    const { username, email, mno, role, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, mno, role, password: hashedPassword });
    await user.save();

    res.json({ success: true, message: "User added successfully", user });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Update user
router.put("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const { username, email, mno, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, mno, role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Delete user
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
