import mongoose from "mongoose";

const TreatmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  category: { type: String, enum: ["Massage", "Hydrotherapy", "Acupuncture", "Diet", "Other"], required: true }
}, { timestamps: true });

export default mongoose.models.Treatment || mongoose.model("Treatment", TreatmentSchema);
