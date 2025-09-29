// models/Service.js
import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["certificate", "card", "document", "verification", "other"]
  },
  pricing: {
    serviceFee: {
      type: Number,
      required: true,
      min: 0
    },
    consultancyCharge: {
      type: Number,
      required: true,
      min: 0
    }
  },
  requiredDocuments: [{
    fieldName: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      default: true
    },
    acceptedFormats: {
      type: [String],
      default: [".pdf", ".jpg", ".jpeg", ".png"]
    },
    maxSize: {
      type: Number,
      default: 5 // MB
    },
    description: String
  }],
  formFields: [{
    fieldName: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      required: true,
      enum: ["text", "email", "tel", "date", "select", "textarea", "number"]
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String], // For select fields
    validation: {
      pattern: String,
      minLength: Number,
      maxLength: Number,
      min: Number,
      max: Number
    },
    placeholder: String,
    helpText: String
  }],
  processingTime: {
    type: String,
    default: "5-7 working days"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: "bi-file-earmark"
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
ServiceSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model("Service", ServiceSchema);