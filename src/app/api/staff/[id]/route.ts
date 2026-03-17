import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Staff from "@/models/Staff";
import Transaction from "@/models/Transaction";
import { createLog } from "@/lib/logger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { allowances, tips, month, year } = await request.json();

    const member = await Staff.findById(id);
    if (!member) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });

    const totalPaid = member.baseSalary + (allowances || 0) + (tips || 0);

    // 1. Record Financial Transaction (Expense)
    const transaction = await Transaction.create({
      type: "Expense",
      category: "Staff Salary",
      amount: totalPaid,
      date: new Date(),
      description: `Salary Payment for ${member.name} (${month}/${year})`,
      referenceId: member._id,
      paymentMethod: "Bank Transfer"
    });

    // 2. Update Staff Payment History
    member.paymentHistory.push({
      month,
      year,
      baseAmount: member.baseSalary,
      allowances: allowances || 0,
      tips: tips || 0,
      totalPaid,
      paidDate: new Date(),
      transactionId: transaction._id
    });

    // Reset pending tips since they've just been paid out
    member.pendingTips = 0;
    
    // Log the salary payment action
    await createLog({
      userName: "System Admin",
      userRole: "Finance",
      action: "Processed Salary",
      details: `Paid Rs. ${totalPaid} (Base: ${member.baseSalary}, Tips: ${tips}, Allowance: ${allowances}) to ${member.name}`,
      path: "/staff"
    });

    await member.save();

    return NextResponse.json(member);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const member = await Staff.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(member);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    console.log(`Attempting to delete staff member: ${id}`);
    
    const member = await Staff.findById(id);
    const result = await Staff.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    await createLog({
      userName: "Admin", // Should be dynamic in the future
      userRole: "Property Owner",
      action: "Deleted Staff Member",
      details: `Removed staff member: ${member?.name || id}`,
      path: `/api/staff/${id}`
    });

    return NextResponse.json({ message: "Staff member removed successfully" });
  } catch (error: any) {
    console.error("Delete Staff Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
