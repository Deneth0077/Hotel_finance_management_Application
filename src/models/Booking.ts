import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: "Guest", required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["Reserved", "Checked-in", "Checked-out", "Cancelled"], 
    default: "Reserved" 
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Partial", "Unpaid", "Refunded"],
    default: "Unpaid"
  },
  totalAmount: { type: Number, required: true },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
