// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------------
// Generate JWT
// ---------------------
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env file");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ---------------------
// Register
// ---------------------
router.post("/register", async (req, res) => {
  const { username, email, mno, password, cpassword } = req.body;

  if (password !== cpassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match!" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, mno, password: hashedPassword });
    await user.save();

    res.json({ success: true, message: "Registration successful! Please login." });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------------
// Setup Admin (only for development)
// ---------------------
router.post("/setup-admin", async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@ogsp.com" });
    if (existingAdmin) {
      return res.json({ success: true, message: "Admin already exists", user: existingAdmin });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = new User({
      username: "Admin",
      email: "admin@ogsp.com",
      mno: "0000000000",
      password: hashedPassword,
      role: "admin"
    });

    await adminUser.save();
    res.json({ success: true, message: "Admin user created successfully", user: adminUser });
  } catch (err) {
    console.error("SETUP ADMIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------------
// Login
// ---------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user in database (including admin)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Email or Password!" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid Email or Password!" });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mno: user.mno,
        role: user.role,
        address: user.address,
        birthdate: user.birthdate,
        photo: user.photo,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------------
// Protected Profile
// ---------------------
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create Admin User (Development/Setup endpoint)
// --------------------------------------------
router.post("/create-admin", async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@ogsp.gov.in" });
    
    if (adminExists) {
      return res.json({
        success: true,
        message: "Admin user already exists",
        credentials: {
          email: "admin@ogsp.gov.in",
          password: "admin123"
        }
      });
    }

    // Create admin user with correct schema
    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    const adminUser = new User({
      username: "admin",
      email: "admin@ogsp.gov.in",
      mno: "9999999999",
      password: hashedPassword,
      role: "admin",
      address: "Government Office",
      birthdate: "1990-01-01"
    });

    await adminUser.save();

    res.json({
      success: true,
      message: "Admin user created successfully",
      credentials: {
        email: "admin@ogsp.gov.in",
        password: "admin123"
      }
    });
  } catch (err) {
    console.error("CREATE ADMIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Error creating admin user",
      error: err.message
    });
  }
});

export default router;
