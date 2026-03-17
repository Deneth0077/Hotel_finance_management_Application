import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Therapist from "@/models/Therapist";

export async function GET() {
  try {
    await connectToDatabase();
    const therapists = await Therapist.find({}).sort({ name: 1 });
    return NextResponse.json(therapists);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const therapist = await Therapist.create(body);
    return NextResponse.json(therapist, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
