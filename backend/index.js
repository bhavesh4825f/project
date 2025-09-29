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
app.use(cors());
app.use(express.json());

// Static uploads folder
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

if (mongoUri) {
  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
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
