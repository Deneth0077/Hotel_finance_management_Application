import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Room from "@/models/Room";
import Booking from "@/models/Booking";
import Guest from "@/models/Guest";

export async function GET() {
  try {
    await connectToDatabase();
    const rooms = await Room.find({}).sort({ roomNumber: 1 }).lean();
    
    // Enrich rooms with active booking data
    const roomsWithDetails = await Promise.all(rooms.map(async (room: any) => {
      if (room.status === "Occupied") {
        const activeBooking = await Booking.findOne({ 
          roomId: room._id, 
          status: "Checked-in" 
        }).populate("guestId").lean();
        
        return { ...room, activeBooking };
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
