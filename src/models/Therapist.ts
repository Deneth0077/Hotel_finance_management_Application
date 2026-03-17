import mongoose from "mongoose";

const TherapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  phone: { type: String },
  specialization: [{ type: String }], // e.g. ["Ayurveda", "Deep Tissue"]
  isActive: { type: Boolean, default: true },
  availability: {
    type: Map,
    of: [String] // e.g. { "Monday": ["09:00-12:00", "14:00-18:00"] }
  }
}, { timestamps: true });

export default mongoose.models.Therapist || mongoose.model("Therapist", TherapistSchema);
