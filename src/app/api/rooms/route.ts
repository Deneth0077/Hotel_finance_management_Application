import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Room from "@/models/Room";
import Booking from "@/models/Booking";
import Guest from "@/models/Guest";

export async function GET() {
  try {
    await connectToDatabase();
    const rooms = await Room.find({}).sort({ roomNumber: 1 }).lean();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Enrich rooms with real-time booking data
    const roomsWithDetails = await Promise.all(rooms.map(async (room: any) => {
      // 1. Check for active Checked-in guests (PRIORITY 1)
      const activeBooking = await Booking.findOne({ 
        roomId: room._id, 
        status: "Checked-in" 
      }).populate("guestId").lean();

      if (activeBooking) {
        // If room is Available but has a guest, "Self-heal" the UI response
        return { 
          ...room, 
          status: "Occupied", 
          activeBooking 
        };
      }

      // 2. Check for upcoming Reserved bookings for TODAY (PRIORITY 2)
      const reservedToday = await Booking.findOne({
        roomId: room._id,
        status: "Reserved",
        checkIn: { $lte: new Date(new Date().setHours(23, 59, 59, 999)) },
        checkOut: { $gte: now }
      }).populate("guestId").lean();

      // 3. Check for the NEXT upcoming booking (For all rooms that aren't occupied today)
      const nextBooking = await Booking.findOne({
        roomId: room._id,
        status: "Reserved",
        checkIn: { $gt: now }
      })
      .sort({ checkIn: 1 })
      .populate("guestId")
      .lean();

      if (nextBooking) {
        // Calculate max stay date (Must leave 1 day early to guarantee 12h+ cleaning window)
        const nextCheckIn = new Date(nextBooking.checkIn);
        const availableUntil = new Date(nextCheckIn);
        availableUntil.setDate(nextCheckIn.getDate() - 1); // Subtract 1 day for safe cleaning

        return {
          ...room,
          nextBooking,
          nextBookingCheckIn: nextCheckIn,
          availableUntilDate: availableUntil
        };
      }

      return room;
    }));

    return NextResponse.json(roomsWithDetails);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const room = await Room.create(body);
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
