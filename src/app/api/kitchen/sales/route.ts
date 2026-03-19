import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import KitchenSale from "@/models/KitchenSale";
import MenuItem from "@/models/MenuItem";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await KitchenSale.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate("menuItemId");
    
    return NextResponse.json(sales);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { menuItemId, quantity, date } = body;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) return NextResponse.json({ error: "Menu item not found" }, { status: 404 });

    const totalCost = menuItem.costPrice * quantity;
    const totalRevenue = menuItem.sellingPrice * quantity;
    const totalProfit = totalRevenue - totalCost;

    const sale = await KitchenSale.create({
      menuItemId,
      quantity,
      date: date || new Date(),
      totalCost,
      totalRevenue,
      totalProfit
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
