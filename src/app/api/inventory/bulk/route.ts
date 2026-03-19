import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import InventoryItem from "@/models/InventoryItem";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Input should be an array of items" }, { status: 400 });
    }

    // Optional: Validation of body items here
    
    const items = await InventoryItem.insertMany(body);
    return NextResponse.json(items, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
