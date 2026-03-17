import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Package from "@/models/Package";

export async function GET() {
  try {
    await connectToDatabase();
    const packages = await Package.find().populate("includedTreatments.treatmentId");
    return NextResponse.json(packages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const newPackage = await Package.create(body);
    return NextResponse.json(newPackage, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
