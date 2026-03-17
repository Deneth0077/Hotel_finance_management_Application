import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  user: {
    name: { type: String, required: true },
    role: { type: String, required: true }
  },
  action: { type: String, required: true }, // e.g., "Created Booking", "Updated Staff", "Deleted Asset"
  details: { type: String }, // Additional info
  path: { type: String }, // The API or Page path
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
