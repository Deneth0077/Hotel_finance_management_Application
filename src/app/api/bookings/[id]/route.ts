import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import { createLog } from "@/lib/logger";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();

    const booking = await Booking.findByIdAndUpdate(id, body, { new: true });
    
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await createLog({
      userName: "System Admin",
      userRole: "Front Desk",
      action: "Modified Booking",
      details: `Updated reservation: ${booking.package}`,
      path: "/bookings"
    });

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    
    await createLog({
      userName: "System Admin",
      userRole: "Front Desk",
      action: "Deleted Booking",
      details: `Removed reservation`,
      path: "/bookings"
    });

    return NextResponse.json({ message: "Booking deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
