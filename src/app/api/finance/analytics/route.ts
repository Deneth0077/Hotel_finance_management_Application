import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET() {
  try {
    await connectToDatabase();

    const transactions = await Transaction.find().sort({ date: -1 });

    const summary = transactions.reduce((acc: any, t: any) => {
      acc[t.type] = (acc[t.type] || 0) + t.amount;
      acc.totalTax = (acc.totalTax || 0) + (t.taxAmount || 0);
      
      // Departmental breakdown
      if (t.type === "Income") {
        acc.departments[t.category] = (acc.departments[t.category] || 0) + t.amount;
      }
      
      // Pending vs Paid
      if (t.status === "Pending") {
        acc.pendingTotal += t.amount;
      }
      
      return acc;
    }, { Income: 0, Expense: 0, totalTax: 0, departments: {}, pendingTotal: 0 });

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const stats = await Transaction.aggregate([
      { $match: { date: { $gt: sixMonthsAgo } } },
      { $group: {
        _id: { 
          month: { $month: "$date" }, 
          year: { $year: "$date" }, 
          type: "$type" 
        },
        total: { $sum: "$amount" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return NextResponse.json({ summary, stats, transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
