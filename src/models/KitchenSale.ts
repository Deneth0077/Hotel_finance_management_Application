import mongoose from "mongoose";

const KitchenSaleSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  totalCost: { type: Number, required: true }, // menuItem.costPrice * quantity
  totalRevenue: { type: Number, required: true }, // menuItem.sellingPrice * quantity
  totalProfit: { type: Number, required: true }, // totalRevenue - totalCost
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.KitchenSale || mongoose.model("KitchenSale", KitchenSaleSchema);
