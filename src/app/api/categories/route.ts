import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({ type: "inventory" });
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const category = await Category.create({ ...body, type: "inventory" });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
