// models/Application.js
import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  applicationType: {
    type: String,
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: false
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "approved", "rejected", "in_progress"]
  },
  documents: {
    adharcard: String,
    passport_photo: String,
    income_proof: String,
    other_documents: [String]
  },
  applicationData: {
    type: mongoose.Schema.Types.Mixed, // Flexible for different application types
    default: {}
  },
  paymentStatus: {
    type: String,
    default: "pending",
    enum: ["pending", "completed", "failed", "refunded"]
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },
  transactionId: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  remarks: String,
  documentSent: {
    type: Boolean,
    default: false
  },
  documentPath: String,
  documentSentAt: Date,
  documentSentBy: String, // Admin username who sent the document
  documentSendingNotes: String, // Admin notes when sending document
  deliveryMethod: {
    type: String,
    enum: ["email", "portal", "pickup", "courier"],
    default: "email"
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

export default mongoose.model("Application", ApplicationSchema);