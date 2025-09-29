import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  serviceFee: {
    type: Number,
    required: true
  },
  consultancyCharge: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentStatus: {
    type: String,
    default: "completed",
    enum: ["pending", "completed", "failed", "refunded"]
  },
  paymentMethod: {
    type: String,
    default: "online",
    enum: ["online", "card", "upi", "netbanking"]
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
PaymentSchema.index({ userId: 1, paymentDate: -1 });
PaymentSchema.index({ applicationId: 1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ paymentStatus: 1 });

export default mongoose.model("Payment", PaymentSchema);