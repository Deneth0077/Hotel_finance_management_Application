import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import "@/models/Guest"; // Ensure models are registered
import "@/models/Room";
import { createLog } from "@/lib/logger";

export async function GET() {
  try {
    await connectToDatabase();
    const bookings = await Booking.find({})
      .populate("guestId")
      .populate("roomId")
      .sort({ createdAt: -1 });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Check for double booking
    const existing = await Booking.findOne({
      roomId: body.roomId,
      status: { $ne: "Cancelled" },
      $or: [
        { checkIn: { $lt: body.checkOut, $gte: body.checkIn } },
        { checkOut: { $gt: body.checkIn, $lte: body.checkOut } },
        { checkIn: { $lte: body.checkIn }, checkOut: { $gte: body.checkOut } }
      ]
    });

    if (existing) {
      return NextResponse.json({ error: "Room is already booked for these dates." }, { status: 400 });
    }

    const booking = await Booking.create(body);
    
    await createLog({
      userName: "System Admin",
      userRole: "Front Desk",
      action: "Created Booking",
      details: `New reservation for package: ${booking.package}`,
      path: "/bookings"
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
