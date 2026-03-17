import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Guest from "@/models/Guest";
import Transaction from "@/models/Transaction";
import { createLog } from "@/lib/logger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { description, amount } = await request.json();
    await connectToDatabase();

    const guest = await Guest.findById(id);
    if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

    // 1. Add to guest extra spendings
    guest.extraSpendings.push({ description, amount, date: new Date() });
    await guest.save();

    // 2. Record in ledger as system activity
    await createLog({
      userName: "System Admin",
      userRole: "Reception",
      action: "Guest Spending Added",
      details: `Added extra spending of Rs. ${amount} for ${guest.name}: ${description}`,
      path: "/guests"
    });

    return NextResponse.json(guest);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { spendingId, description, amount } = await request.json();
    await connectToDatabase();

    const guest = await Guest.findOneAndUpdate(
      { _id: id, "extraSpendings._id": spendingId },
      { 
        $set: { 
          "extraSpendings.$.description": description,
          "extraSpendings.$.amount": amount
        } 
      },
      { new: true }
    );

    if (!guest) return NextResponse.json({ error: "Guest or spending record not found" }, { status: 404 });

    return NextResponse.json(guest);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const { searchParams } = new URL(request.url);
      const spendingId = searchParams.get("spendingId");
      
      await connectToDatabase();
  
      const guest = await Guest.findByIdAndUpdate(
        id,
        { $pull: { extraSpendings: { _id: spendingId } } },
        { new: true }
      );
  
      if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  
      return NextResponse.json(guest);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
