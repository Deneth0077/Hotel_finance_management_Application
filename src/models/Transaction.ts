import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["Income", "Expense"], 
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      "Room Booking", 
      "Treatment Payment", 
      "Food Package", 
      "Extra Service", 
      "Staff Salary", 
      "Kitchen Purchase", 
      "Medicine Purchase", 
      "Electricity", 
      "Maintenance", 
      "Cleaning Supplies",
      "Other"
    ], 
    required: true 
  },
  amount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  description: { type: String },
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // Link to Booking, TreatmentSession, etc.
  status: { 
    type: String, 
    enum: ["Paid", "Pending", "Void"], 
    default: "Paid" 
  },
  paymentMethod: { 
    type: String, 
    enum: ["Cash", "Card", "Bank Transfer", "Online"], 
    default: "Cash" 
  },
  auditLog: [{
    user: { type: String },
    action: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
