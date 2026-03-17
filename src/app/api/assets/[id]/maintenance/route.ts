import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Asset from "@/models/Asset";
import Transaction from "@/models/Transaction";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json(); // { date, type, cost, technician, notes }

    // 1. Update Asset Maintenance History
    const asset = await Asset.findByIdAndUpdate(
      id,
      { 
        $push: { maintenanceHistory: body },
        $set: { condition: body.condition || "Good" } // Allow updating condition during maintenance
      },
      { new: true }
    );

    // 2. Create Financial Expense Transaction
    if (body.cost > 0) {
      await Transaction.create({
        type: "Expense",
        category: "Maintenance",
        amount: body.cost,
        date: body.date || new Date(),
        description: `Maintenance for asset: ${asset.name} (${body.type})`,
        referenceId: asset._id,
        paymentMethod: "Bank Transfer"
      });
    }

    return NextResponse.json(asset);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
