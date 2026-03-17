import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Main Bank Loan", "Van Lease"
  type: { 
    type: String, 
    enum: ["Bank Loan", "Leasing", "Personal Loan", "Credit Line"], 
    required: true 
  },
  lender: { type: String, required: true }, // Bank or Leasing Company name
  principalAmount: { type: Number, required: true }, // Initial amount
  interestRate: { type: Number, required: true }, // Annual interest rate (%)
  tenureMonths: { type: Number, required: true }, // Total months
  startDate: { type: Date, required: true },
  monthlyInstallment: { type: Number, required: true }, // Combined capital + interest
  repaymentDay: { type: Number, default: 1 }, // Day of month (1-31)
  status: { 
    type: String, 
    enum: ["Active", "Settled", "Defaulted"], 
    default: "Active" 
  },
  remainingBalance: { type: Number }, // Current outstanding
  notes: { type: String },
  repaymentHistory: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }
  }]
}, { timestamps: true });

export default mongoose.models.Loan || mongoose.model("Loan", LoanSchema);
