import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Guest from "@/models/Guest";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();

    const guest = await Guest.findByIdAndUpdate(id, body, { new: true });
    
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update guest" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    await Guest.findByIdAndDelete(id);
    return NextResponse.json({ message: "Guest deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete guest" }, { status: 500 });
  }
}
