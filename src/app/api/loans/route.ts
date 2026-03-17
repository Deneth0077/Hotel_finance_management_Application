import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Loan from "@/models/Loan";
import Transaction from "@/models/Transaction";

export async function GET() {
  try {
    await connectToDatabase();
    const loans = await Loan.find().sort({ createdAt: -1 });

    const summary = loans.reduce((acc: any, loan: any) => {
      if (loan.status === "Active") {
        acc.totalDebt += loan.remainingBalance || 0;
        acc.monthlyTotal += loan.monthlyInstallment || 0;
      }
      return acc;
    }, { totalDebt: 0, monthlyTotal: 0 });

    return NextResponse.json({ loans, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Initial remaining balance is often the principal for a new loan recorded
    if (!body.remainingBalance) {
      body.remainingBalance = body.principalAmount;
    }
    
    body.auditLog = [{
      action: "Created",
      details: "Initial structured setup.",
      timestamp: new Date()
    }];
    
    const loan = await Loan.create(body);
    return NextResponse.json(loan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
