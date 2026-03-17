import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Guest from "@/models/Guest";
import Booking from "@/models/Booking";
import TreatmentSession from "@/models/TreatmentSession";
import Room from "@/models/Room";
import "@/models/Treatment"; // Register for population
import "@/models/Therapist";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // 1. Get Guest Basic Profile
    const guest = await Guest.findById(id).lean();
    if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

    // 2. Get active/last booking
    const booking = await Booking.findOne({ guestId: id })
      .sort({ createdAt: -1 })
      .populate("roomId")
      .lean();

    // 3. Get all treatment sessions linked to this guest
    const treatments = await TreatmentSession.find({ guestId: id })
      .populate("treatmentId")
      .populate("therapistId")
      .sort({ scheduledTime: -1 })
      .lean();

    return NextResponse.json({
      guest,
      booking,
      treatments
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
