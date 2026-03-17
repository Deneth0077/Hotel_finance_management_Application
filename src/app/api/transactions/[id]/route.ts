import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    // Find and void/delete the transaction from the ledger
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found in ledger" }, { status: 404 });
    }

    return NextResponse.json({ message: "Transaction voided successfully from ledger", transaction });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to void transaction from ledger: " + error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();

    const transaction = await Transaction.findByIdAndUpdate(id, body, { new: true });
    
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}
