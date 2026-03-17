import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import Transaction from "@/models/Transaction";
import "@/models/Guest"; // Ensure models are registered for populate

export async function GET() {
  try {
    await connectToDatabase();
    
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);

    // 1. Metric Counts
    const [todayBookings, activeGuests, availableRooms] = await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
      Booking.countDocuments({ status: "Checked-in" }),
      Room.countDocuments({ status: "Available" })
    ]);

    // 2. Real Revenue & Expenses from Transactions
    const transactions = await Transaction.find({
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    const todayRevenue = transactions
      .filter(t => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);

    const todayExpenses = transactions
      .filter(t => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // 3. Upcoming Activities
    const [upcomingCheckins, upcomingCheckouts] = await Promise.all([
      Booking.find({
        checkIn: { $gte: startOfToday, $lte: endOfToday },
        status: "Reserved"
      }).populate("guestId roomId"),
      Booking.find({
        checkOut: { $gte: startOfToday, $lte: endOfToday },
        status: "Checked-in"
      }).populate("guestId roomId")
    ]);

    return NextResponse.json({
      metrics: {
        todayBookings,
        activeGuests,
        availableRooms,
        todayRevenue,
        todayExpenses
      },
      activity: {
        checkins: upcomingCheckins.map(b => ({
          guest: b.guestId?.name || "Guest",
          room: b.roomId?.roomNumber || "TBD",
          time: "14:00"
        })),
        checkouts: upcomingCheckouts.map(b => ({
          guest: b.guestId?.name || "Guest",
          room: b.roomId?.roomNumber || "TBD",
          time: "11:00"
        }))
      }
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
