// routes/application.js
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import Application from "../models/Application.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------------
// Multer setup for file uploads
// ---------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// ---------------------
// Submit Application
// ---------------------
router.post("/submit", protect, upload.any(), async (req, res) => {
  try {
    console.log("=== APPLICATION SUBMISSION DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("User ID:", req.userId);
    
    const { applicationType, serviceId, ...applicationData } = req.body;
    
    console.log("Application type:", applicationType);
    console.log("Service ID:", serviceId);
    console.log("Application data:", applicationData);

    // Validate required fields - either applicationType (legacy) or serviceId (dynamic)
    if (!applicationType && !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Application type or service ID is required"
      });
    }

    // Handle dynamic services
    let serviceData = null;
    let finalApplicationType = applicationType;
    
    if (serviceId) {
      try {
        serviceData = await Service.findById(serviceId);
        if (!serviceData) {
          return res.status(404).json({
            success: false,
            message: "Service not found"
          });
        }
        if (!serviceData.isActive) {
          return res.status(400).json({
            success: false,
            message: "Service is not active"
          });
        }
        finalApplicationType = serviceData.name;
        console.log("Using dynamic service:", serviceData.displayName);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid service ID"
        });
      }
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Prepare documents object - handle both legacy and dynamic document fields
    const documents = {};
    if (req.files) {
      console.log("Processing uploaded files...");
      
      // Process all files dynamically
      req.files.forEach(file => {
        documents[file.fieldname] = file.filename;
        console.log(`Document ${file.fieldname}:`, file.filename);
      });
    } else {
      console.log("No files uploaded");
    }
    
    console.log("Final documents object:", documents);

    // Create application payload
    const applicationPayload = {
      userId: req.userId,
      applicationType: finalApplicationType,
      documents,
      applicationData,
      status: "pending",
      paymentStatus: "pending"
    };
    
    // Add serviceId for dynamic services
    if (serviceId) {
      applicationPayload.serviceId = serviceId;
    }

    console.log("Creating new application with data:", applicationPayload);
    
    const application = new Application(applicationPayload);

    console.log("Saving application to database...");
    await application.save();
    console.log("Application saved successfully with ID:", application._id);

    res.json({
      success: true,
      message: "Application submitted successfully!",
      applicationId: application._id
    });

  } catch (err) {
    console.error("APPLICATION SUBMISSION ERROR:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    // More specific error messages
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error: " + validationErrors.join(', ')
      });
    }
    
    if (err.name === 'MongoNetworkError' || err.name === 'MongoError') {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again later."
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error while submitting application"
    });
  }
});

// ---------------------
// Get User's Applications
// ---------------------
router.get("/my-applications", protect, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.userId })
      .sort({ submittedAt: -1 })
      .populate("processedBy", "username");

    res.json({ success: true, applications });
  } catch (err) {
    console.error("GET APPLICATIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching applications"
    });
  }
});

// ---------------------
// Get All Applications (Admin only)
// ---------------------
router.get("/all", protect, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required."
      });
    }

    const applications = await Application.find()
      .sort({ submittedAt: -1 })
      .populate("userId", "username email")
      .populate("processedBy", "username");

    res.json({ success: true, applications });
  } catch (err) {
    console.error("GET ALL APPLICATIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching applications"
    });
  }
});

// ---------------------
// Update Application Status (Admin only)
// ---------------------
router.patch("/update-status/:id", protect, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required."
      });
    }

    const { status, remarks } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        remarks,
        processedAt: new Date(),
        processedBy: req.userId
      },
      { new: true }
    ).populate("userId", "username email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.json({
      success: true,
      message: "Application status updated successfully",
      application
    });

  } catch (err) {
    console.error("UPDATE APPLICATION STATUS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating application"
    });
  }
});

// ---------------------
// Get Approved Applications (not yet sent documents)
// ---------------------
router.get("/approved", protect, async (req, res) => {
  try {
    const applications = await Application.find({ 
      status: "approved",
      documentSent: { $ne: true }  // Only get applications where document hasn't been sent yet
    }).populate("userId", "username email");

    console.log("APPROVED APPLICATIONS FOUND:", applications.length);
    console.log("Applications:", applications.map(app => ({
      id: app._id,
      type: app.applicationType,
      user: app.userId?.username,
      status: app.status,
      documentSent: app.documentSent
    })));

    res.json({
      success: true,
      applications
    });

  } catch (err) {
    console.error("GET APPROVED APPLICATIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching approved applications"
    });
  }
});

// ---------------------
// Send Document to Client
// ---------------------
router.post("/send-document", protect, upload.single("document"), async (req, res) => {
  try {
    const { applicationId, userId, serviceType, deliveryMethod, sendingNotes } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required"
      });
    }

    // Get admin user info for tracking
    const adminUser = await User.findById(req.userId);
    
    // Update application to mark document as sent
    const application = await Application.findByIdAndUpdate(
      applicationId,
      {
        documentSent: true,
        documentPath: req.file.path,
        documentSentAt: new Date(),
        documentSentBy: adminUser ? adminUser.username : 'Admin',
        documentSendingNotes: sendingNotes || '',
        deliveryMethod: deliveryMethod || 'email',
        sentBy: req.userId
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.json({
      success: true,
      message: "Document sent successfully",
      application
    });

  } catch (err) {
    console.error("SEND DOCUMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while sending document"
    });
  }
});

// ---------------------
// Get User's Received Documents
// ---------------------
router.get("/my-documents", protect, async (req, res) => {
  try {
    const applications = await Application.find({ 
      userId: req.userId,
      documentSent: true 
    }).select("applicationType documentPath documentSentAt serviceType");

    const documents = applications.map(app => ({
      id: app._id,
      serviceType: app.applicationType || app.serviceType,
      documentPath: app.documentPath,
      sentAt: app.documentSentAt,
      fileName: app.documentPath ? app.documentPath.split('/').pop() : 'document'
    }));

    res.json({
      success: true,
      documents
    });

  } catch (err) {
    console.error("GET MY DOCUMENTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching documents"
    });
  }
});

// ---------------------
// Debug: Get All Applications (for testing)
// ---------------------
router.get("/all-debug", protect, async (req, res) => {
  try {
    const applications = await Application.find({}).populate("userId", "username email");
    
    console.log("ALL APPLICATIONS DEBUG:");
    applications.forEach(app => {
      console.log(`ID: ${app._id}, Type: ${app.applicationType}, User: ${app.userId?.username}, Status: ${app.status}, DocumentSent: ${app.documentSent}, PaymentStatus: ${app.paymentStatus}`);
    });

    res.json({
      success: true,
      count: applications.length,
      applications: applications.map(app => ({
        id: app._id,
        applicationType: app.applicationType,
        username: app.userId?.username,
        email: app.userId?.email,
        status: app.status,
        documentSent: app.documentSent,
        paymentStatus: app.paymentStatus,
        submittedAt: app.submittedAt
      }))
    });

  } catch (err) {
    console.error("DEBUG ALL APPLICATIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching all applications"
    });
  }
});

// ---------------------
// Get Application Details by ID
// ---------------------
router.get("/details/:id", protect, async (req, res) => {
  console.log("=== APPLICATION DETAILS REQUEST ===");
  console.log("Request received at:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("Request headers:", req.headers.authorization ? "Token present" : "No token");
  
  try {
    const applicationId = req.params.id;
    console.log("GET APPLICATION DETAILS - ID:", applicationId);
    console.log("User ID from token:", req.userId);
    console.log("User role from token:", req.userRole);
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      console.log("Invalid ObjectId format:", applicationId);
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format"
      });
    }
    
    const application = await Application.findById(applicationId)
      .populate("userId", "username email role")
      .populate("serviceId", "displayName pricing");

    console.log("Application found:", application ? "YES" : "NO");
    
    if (!application) {
      console.log("Application not found in database");
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    console.log("Application user ID:", application.userId._id.toString());
    console.log("Requesting user ID:", req.userId);
    console.log("Requesting user role:", req.userRole);

    // Check if user has permission to view this application
    if (req.userRole !== "admin" && application.userId._id.toString() !== req.userId) {
      console.log("Access denied - user can only view own applications");
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own applications."
      });
    }

    console.log("Sending application data successfully");
    res.json({
      success: true,
      application
    });

  } catch (err) {
    console.error("GET APPLICATION DETAILS ERROR:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      success: false,
      message: "Server error while fetching application details",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ---------------------
// Delete Application (Admin Only)
// ---------------------
router.delete("/:id", protect, async (req, res) => {
  try {
    console.log("=== DELETE APPLICATION DEBUG ===");
    console.log("Application ID:", req.params.id);
    console.log("User role:", req.userRole);

    // Only admin can delete applications
    if (req.userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can delete applications."
      });
    }

    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    console.log("Application deleted successfully");
    res.json({
      success: true,
      message: "Application deleted successfully"
    });

  } catch (err) {
    console.error("DELETE APPLICATION ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while deleting application",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;