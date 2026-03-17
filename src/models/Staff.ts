import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true }, // e.g., "Chef", "Therapist", "Cleaner"
  email: { type: String },
  phone: { type: String },
  baseSalary: { type: Number, required: true },
  allowance: { type: Number, default: 0 }, // Additional profile-based allowance (dimana)
  pendingTips: { type: Number, default: 0 }, // Tips allocated but not yet paid
  joiningDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["Active", "On Leave", "Terminated"], 
    default: "Active" 
  },
  paymentHistory: [{
    month: { type: Number },
    year: { type: Number },
    baseAmount: { type: Number },
    allowances: { type: Number, default: 0 },
    tips: { type: Number, default: 0 },
    totalPaid: { type: Number },
    paidDate: { type: Date, default: Date.now },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }
  }]
}, { timestamps: true });

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
