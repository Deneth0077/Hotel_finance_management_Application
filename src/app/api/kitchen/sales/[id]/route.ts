import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import KitchenSale from "@/models/KitchenSale";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const item = await KitchenSale.findByIdAndDelete(id);
    if (!item) return NextResponse.json({ error: "Sale record not found" }, { status: 404 });
    return NextResponse.json({ message: "Sale deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
