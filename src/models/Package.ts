import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in days
  price: { type: Number, required: true },
  includedTreatments: [{
    treatmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Treatment" },
    quantity: { type: Number, default: 1 }
  }]
}, { timestamps: true });

export default mongoose.models.Package || mongoose.model("Package", PackageSchema);
