// routes/contact.js
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Contact Query Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, default: "General Inquiry" },
  message: { type: String, required: true },
  status: { type: String, default: "pending", enum: ["pending", "resolved"] },
  submittedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
  adminResponse: { type: String }
});

const Contact = mongoose.model("Contact", contactSchema);

// ---------------------
// Submit Contact Query
// ---------------------
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, and message are required fields." 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid email address." 
      });
    }

    // Create contact entry
    const contactEntry = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject || "General Inquiry",
      message: message.trim()
    });

    await contactEntry.save();

    res.status(201).json({
      success: true,
      message: "Thank you for contacting us! We will get back to you soon.",
      contactId: contactEntry._id
    });

  } catch (error) {
    console.error("CONTACT SUBMIT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later."
    });
  }
});

// ---------------------
// Get All Contact Queries (Admin Only)
// ---------------------
router.get("/queries", async (req, res) => {
  try {
    const queries = await Contact.find()
      .sort({ submittedAt: -1 })
      .limit(100); // Limit to latest 100 queries

    res.json({
      success: true,
      queries: queries
    });

  } catch (error) {
    console.error("GET CONTACT QUERIES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact queries."
    });
  }
});

// ---------------------
// Update Query Status (Admin Only)
// ---------------------
router.patch("/queries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const query = await Contact.findById(id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Contact query not found."
      });
    }

    if (status) query.status = status;
    if (adminResponse) {
      query.adminResponse = adminResponse;
      query.respondedAt = new Date();
    }

    await query.save();

    res.json({
      success: true,
      message: "Query updated successfully.",
      query: query
    });

  } catch (error) {
    console.error("UPDATE CONTACT QUERY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact query."
    });
  }
});

// ---------------------
// Delete Contact Query (Admin Only)
// ---------------------
router.delete("/queries/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = await Contact.findById(id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Contact query not found."
      });
    }

    await Contact.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Query deleted successfully."
    });

  } catch (error) {
    console.error("DELETE CONTACT QUERY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact query."
    });
  }
});

export default router;