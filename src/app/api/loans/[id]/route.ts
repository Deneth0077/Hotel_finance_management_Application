import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Loan from "@/models/Loan";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();

    const existingLoan = await Loan.findById(id);
    if (!existingLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Determine what changed for the audit log
    const changes: string[] = [];
    if (body.name && body.name !== existingLoan.name) changes.push(`Name: ${existingLoan.name} -> ${body.name}`);
    if (body.principalAmount && body.principalAmount !== existingLoan.principalAmount) changes.push(`Principal: ${existingLoan.principalAmount} -> ${body.principalAmount}`);
    if (body.interestRate !== undefined && body.interestRate !== existingLoan.interestRate) changes.push(`Interest: ${existingLoan.interestRate}% -> ${body.interestRate}%`);
    if (body.tenureMonths && body.tenureMonths !== existingLoan.tenureMonths) changes.push(`Tenure: ${existingLoan.tenureMonths} -> ${body.tenureMonths}m`);
    if (body.monthlyInstallment && body.monthlyInstallment !== existingLoan.monthlyInstallment) changes.push(`Installment: ${existingLoan.monthlyInstallment} -> ${body.monthlyInstallment}`);
    if (body.status && body.status !== existingLoan.status) changes.push(`Status: ${existingLoan.status} -> ${body.status}`);

    body.$push = {
      auditLog: {
        action: "Updated",
        details: changes.length > 0 ? changes.join(", ") : "Manual Edit",
        timestamp: new Date()
      }
    };

    const updatedLoan = await Loan.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updatedLoan);
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
    await connectToDatabase();
    
    const loan = await Loan.findByIdAndDelete(id);
    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Loan deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete loan: " + error.message }, { status: 500 });
  }
}
