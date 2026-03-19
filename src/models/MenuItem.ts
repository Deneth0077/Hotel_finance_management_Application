import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  costPrice: { type: Number, required: true }, // Cost to make the meal
  sellingPrice: { type: Number, required: true }, // Price sold to guest
  category: { type: String, default: "General" }, // Starter, Main, Dessert, Beverage
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
