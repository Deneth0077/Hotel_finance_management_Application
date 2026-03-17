import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Guest from "@/models/Guest";

export async function GET() {
  try {
    await connectToDatabase();
    const guests = await Guest.find({}).sort({ name: 1 });
    return NextResponse.json(guests);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const guest = await Guest.create(body);
    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
  }
}
