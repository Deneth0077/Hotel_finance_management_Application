import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Loan from "@/models/Loan";
import Transaction from "@/models/Transaction";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json(); // { date, amount, user }

    const loan = await Loan.findById(id);
    if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });

    // 1. Create Financial Expense Transaction
    const transaction = await Transaction.create({
      type: "Expense",
      category: loan.type === "Leasing" ? "Other" : "Maintenance", // Categorization can be refined
      amount: body.amount,
      date: body.date || new Date(),
      description: `Loan Repayment: ${loan.name} (${loan.lender})`,
      referenceId: loan._id,
      paymentMethod: "Bank Transfer"
    });

    // 2. Update Loan Balance and History
    loan.remainingBalance = Math.max(0, loan.remainingBalance - body.amount);
    loan.repaymentHistory.push({
      date: body.date || new Date(),
      amount: body.amount,
      transactionId: transaction._id
    });

    if (loan.remainingBalance === 0) {
      loan.status = "Settled";
    }

    await loan.save();

    return NextResponse.json(loan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
