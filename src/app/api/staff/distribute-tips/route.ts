import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Staff from "@/models/Staff";
import { createLog } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid tip amount" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Count active staff to distribute among
    const activeStaffCount = await Staff.countDocuments({ status: "Active" });
    if (activeStaffCount === 0) {
      return NextResponse.json({ error: "No active staff found to distribute tips" }, { status: 400 });
    }
    
    // Calculate equal split per active staff member
    const splitAmount = parseFloat((amount / activeStaffCount).toFixed(2));
    
    // Increment the pendingTips field for all active staff
    await Staff.updateMany({ status: "Active" }, { $inc: { pendingTips: splitAmount } });
    
    // Log this system action
    await createLog({
      userName: "System Admin",
      userRole: "Finance",
      action: "Distributed Tips",
      details: `Distributed total pool of Rs. ${amount} among ${activeStaffCount} active staff (Rs. ${splitAmount}/each)`,
      path: "/staff"
    });

    return NextResponse.json({ 
      message: "Tips successfully distributed", 
      splitAmount, 
      activeStaffCount 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
