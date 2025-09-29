// routes/profile.js
import express from "express";
import multer from "multer";
import path from "path";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------------
// Multer setup
// ---------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// ---------------------
// Get profile
// ---------------------
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("PROFILE GET ERROR:", err);
    res.status(500).json({ success: false, message: "Server error while fetching profile" });
  }
});

// ---------------------
// Update profile
// ---------------------
router.post("/update", protect, upload.single("photo"), async (req, res) => {
  try {
    // Handle legacy "admin" ID
    let user;
    if (req.userId === "admin") {
      // For legacy admin token, find or create admin user
      user = await User.findOne({ email: "admin@ogsp.com" });
      if (!user) {
        // Create admin user if it doesn't exist
        const hashedPassword = await bcrypt.hash("admin123", 10);
        user = new User({
          username: "Admin",
          email: "admin@ogsp.com",
          mno: "0000000000",
          password: hashedPassword,
          role: "admin"
        });
        await user.save();
      }
    } else {
      user = await User.findById(req.userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, mobile, address, birthdate } = req.body;

    if (name) {
      user.username = name;
    }
    if (mobile) {
      user.mno = mobile;
    }
    if (address) {
      user.address = address;
    }
    if (birthdate) {
      user.birthdate = birthdate;
    }
    if (req.file) {
      user.photo = req.file.filename;
    }

    await user.save();

    res.json({ success: true, message: "Profile updated successfully!", user });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error while updating profile" });
  }
});

// ---------------------
// Change password
// ---------------------
router.post("/change-password", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { old_password, new_password } = req.body;

    // Check old password
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);

    await user.save();
    res.json({ success: true, message: "Password changed successfully!" });
  } catch (err) {
    console.error("PASSWORD CHANGE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error while changing password" });
  }
});

export default router;
