import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import TreatmentSession from "@/models/TreatmentSession";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    
    let query: any = {};
    if (bookingId) query.bookingId = bookingId;

    const sessions = await TreatmentSession.find(query)
      .populate("treatmentId")
      .populate("therapistId")
      .sort({ scheduledTime: 1 });
      
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const session = await TreatmentSession.create(body);
    return NextResponse.json(session, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
