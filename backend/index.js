import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import profileRoutes from "./routes/profile.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import applicationRoutes from "./routes/application.js";
import contactRoutes from "./routes/contact.js";
import paymentRoutes from "./routes/payment.js";
import serviceRoutes from "./routes/service.js";

dotenv.config();

const app = express();

// ---------------------
// Middleware
// ---------------------
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://project-nz5c2pquk-bhavesh4825fs-projects.vercel.app', // Your Vercel deployment
    'https://*.vercel.app', // Any Vercel deployment
    'https://vercel.app' // Vercel domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Static uploads folder
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------
// Health Check Route
// ---------------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Government Services Portal Backend is running!",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/",
      services: "/api/service/active",
      auth: "/api/auth/login",
      register: "/api/auth/register"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

// Database connectivity test
app.get("/api/db-test", async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Database connection test",
      mongodb: {
        connected: mongoose.connection.readyState === 1,
        state: mongoose.connection.readyState,
        stateText: {
          0: 'disconnected',
          1: 'connected', 
          2: 'connecting',
          3: 'disconnecting'
        }[mongoose.connection.readyState],
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database test failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Environment variables check (for debugging)
app.get("/api/env-check", (req, res) => {
  res.json({
    success: true,
    message: "Environment variables check",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGO_URI_EXISTS: !!process.env.MONGO_URI,
      MONGO_URI_TYPE: process.env.MONGO_URI ? 
        (process.env.MONGO_URI.includes('mongodb.net') ? 'MongoDB Atlas' : 
         process.env.MONGO_URI.includes('localhost') ? 'Local MongoDB' : 'Other') : 'Not Set'
    },
    mongodb: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState,
      stateText: {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
      }[mongoose.connection.readyState]
    },
    timestamp: new Date().toISOString()
  });
});

// ---------------------
// API Routes
// ---------------------
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/service", serviceRoutes);

// ---------------------
// DB Connection
// ---------------------
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ogsp";

console.log("🔍 MongoDB Connection Info:");
console.log("Environment:", process.env.NODE_ENV);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("Using connection:", mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

if (mongoUri) {
  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log("✅ MongoDB connected successfully");
      console.log("Database name:", mongoose.connection.name);
      console.log("Connection state:", mongoose.connection.readyState);
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        code: err.code
      });
      console.log("⚠️ Continuing without MongoDB - some features may not work");
    });
} else {
  console.log("⚠️ No MongoDB URI provided - continuing without database");
}

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Accept connections from any IP address

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Remote access: http://YOUR_IP_ADDRESS:${PORT}`);
  console.log(`💡 To find your IP: run 'ipconfig' in terminal`);
});
