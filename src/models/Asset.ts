import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      "Land", "Buildings", "Guest Rooms", "Furniture", 
      "Kitchen Equipment", "Medical Equipment", "Spa Equipment", 
      "Vehicles", "Electronics", "Pool Equipment", 
      "Garden Equipment", "Other Assets"
    ], 
    required: true 
  },
  location: { type: String },
  purchaseDate: { type: Date, required: true },
  purchasePrice: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  depreciationRate: { type: Number, default: 0 }, // Annual %
  condition: { 
    type: String, 
    enum: ["Excellent", "Good", "Fair", "Poor", "Needs Repair"], 
    default: "Good" 
  },
  maintenanceSchedule: { type: String }, // e.g. "Monthly", "Quarterly"
  annualMaintenanceCost: { type: Number, default: 0 },
  supplier: { type: String },
  notes: { type: String },
  maintenanceHistory: [{
    date: { type: Date, default: Date.now },
    type: { type: String },
    cost: { type: Number, default: 0 },
    technician: { type: String },
    notes: { type: String }
  }],
  valueHistory: [{
    date: { type: Date, default: Date.now },
    value: { type: Number }
  }]
}, { timestamps: true });

export default mongoose.models.Asset || mongoose.model("Asset", AssetSchema);
