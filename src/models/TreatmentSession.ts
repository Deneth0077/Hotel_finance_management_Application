import mongoose from "mongoose";

const TreatmentSessionSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: "Guest", required: true },
  treatmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Treatment", required: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: "Therapist" },
  scheduledTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["Scheduled", "Completed", "Cancelled", "No-show"], 
    default: "Scheduled" 
  },
  therapistNotes: { type: String },
  sessionPrice: { type: Number } // Can be different from base price if discounted
}, { timestamps: true });

export default mongoose.models.TreatmentSession || mongoose.model("TreatmentSession", TreatmentSessionSchema);
