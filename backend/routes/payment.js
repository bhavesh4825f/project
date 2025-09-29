import express from "express";
import Payment from "../models/Payment.js";
import Application from "../models/Application.js";
import Service from "../models/Service.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Fallback service fee configuration for legacy services
const FALLBACK_SERVICE_FEES = {
  "PAN Card": { serviceFee: 100, consultancyCharge: 20 },
  "Income Certificate": { serviceFee: 50, consultancyCharge: 20 },
  "Caste Certificate": { serviceFee: 30, consultancyCharge: 20 },
  "Birth Certificate": { serviceFee: 25, consultancyCharge: 20 }
};

// ---------------------
// Process Payment
// ---------------------
router.post("/process", protect, async (req, res) => {
  try {
    const { applicationId, serviceType } = req.body;

    // Validate application exists
    const application = await Application.findById(applicationId).populate('serviceId');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Get fee structure from Service model or fallback
    let feeStructure;
    if (application.serviceId) {
      // Use dynamic service pricing
      feeStructure = {
        serviceFee: application.serviceId.pricing.serviceFee,
        consultancyCharge: application.serviceId.pricing.consultancyCharge
      };
    } else {
      // Fallback to hardcoded pricing for legacy services
      feeStructure = FALLBACK_SERVICE_FEES[serviceType];
      if (!feeStructure) {
        return res.status(400).json({
          success: false,
          message: "Invalid service type and no pricing found"
        });
      }
    }

    const { serviceFee, consultancyCharge } = feeStructure;
    const totalAmount = serviceFee + consultancyCharge;

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create payment record
    const payment = new Payment({
      userId: req.userId,
      applicationId,
      serviceType,
      serviceFee,
      consultancyCharge,
      totalAmount,
      transactionId,
      paymentStatus: "completed",
      paymentMethod: "online"
    });

    await payment.save();

    // Update application with payment info
    await Application.findByIdAndUpdate(applicationId, {
      paymentStatus: "completed",
      paymentId: payment._id,
      transactionId: payment.transactionId
    });

    res.json({
      success: true,
      message: "Payment processed successfully",
      payment: {
        transactionId: payment.transactionId,
        totalAmount: payment.totalAmount,
        serviceFee: payment.serviceFee,
        consultancyCharge: payment.consultancyCharge,
        paymentDate: payment.paymentDate,
        paymentStatus: payment.paymentStatus
      }
    });

  } catch (error) {
    console.error("PAYMENT PROCESSING ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Payment processing failed"
    });
  }
});

// ---------------------
// Get User Payment History
// ---------------------
router.get("/history", protect, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .populate("applicationId", "applicationType submittedAt")
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error("GET PAYMENT HISTORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history"
    });
  }
});

// ---------------------
// Get All Payments (Admin)
// ---------------------
router.get("/admin/history", protect, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "username email")
      .populate("applicationId", "applicationType submittedAt")
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error("GET ADMIN PAYMENT HISTORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history"
    });
  }
});

// ---------------------
// Get Payment by Transaction ID
// ---------------------
router.get("/transaction/:transactionId", protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      transactionId: req.params.transactionId 
    })
    .populate("userId", "username email")
    .populate("applicationId", "applicationType submittedAt");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error("GET PAYMENT BY TRANSACTION ID ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details"
    });
  }
});

// ---------------------
// Get Fee Structure
// ---------------------
router.get("/fees/:serviceType", (req, res) => {
  try {
    const { serviceType } = req.params;
    const feeStructure = SERVICE_FEES[serviceType];
    
    if (!feeStructure) {
      return res.status(400).json({
        success: false,
        message: "Invalid service type"
      });
    }

    const { serviceFee, consultancyCharge } = feeStructure;
    
    res.json({
      success: true,
      feeStructure: {
        serviceType,
        serviceFee,
        consultancyCharge,
        totalAmount: serviceFee + consultancyCharge
      }
    });

  } catch (error) {
    console.error("GET FEE STRUCTURE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fee structure"
    });
  }
});

export default router;