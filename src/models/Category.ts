import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  type: { type: String, default: "inventory" }, // To distinguish from other possible category types
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
