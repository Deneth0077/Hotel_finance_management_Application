import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import InventoryItem from "@/models/InventoryItem";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();
    const item = await InventoryItem.findByIdAndUpdate(id, body, { new: true });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const item = await InventoryItem.findByIdAndDelete(id);
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

