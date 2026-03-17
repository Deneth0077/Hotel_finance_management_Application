import mongoose from "mongoose";

const GuestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  medicalCondition: [{ type: String }],
  emergencyContact: { type: String },
  notes: { type: String },
  status: { type: String, enum: ["Active", "Arriving", "Checked Out"], default: "Arriving" }
}, { timestamps: true });

export default mongoose.models.Guest || mongoose.model("Guest", GuestSchema);
