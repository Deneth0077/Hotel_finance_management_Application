import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MenuItem from "@/models/MenuItem";

export async function GET() {
  try {
    await connectToDatabase();
    const items = await MenuItem.find({ isAvailable: true });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const item = await MenuItem.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
