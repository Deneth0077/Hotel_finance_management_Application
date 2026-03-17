import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Treatment from "@/models/Treatment";

export async function GET() {
  try {
    await connectToDatabase();
    const treatments = await Treatment.find({}).sort({ name: 1 });
    return NextResponse.json(treatments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch treatments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const treatment = await Treatment.create(body);
    return NextResponse.json(treatment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create treatment" }, { status: 500 });
  }
}
