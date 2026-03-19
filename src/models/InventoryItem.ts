import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true 
  },
  currentStock: { type: Number, required: true, default: 0 },
  minThreshold: { type: Number, required: true, default: 5 },
  unit: { type: String, required: true }, // kg, ml, pieces
  lastRestocked: { type: Date },
  supplier: { type: String }
}, { timestamps: true });

export default mongoose.models.InventoryItem || mongoose.model("InventoryItem", InventoryItemSchema);
