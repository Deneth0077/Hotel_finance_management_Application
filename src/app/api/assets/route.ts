import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Asset from "@/models/Asset";

export async function GET() {
  try {
    await connectToDatabase();
    const assets = await Asset.find().sort({ createdAt: -1 });

    // Calculate valuation summary
    const summary = assets.reduce((acc: any, asset: any) => {
      acc.totalValue += asset.currentValue;
      acc.totalMaintenance += asset.annualMaintenanceCost;
      if (asset.category === "Land" || asset.category === "Buildings") {
        acc.propertyValue += asset.currentValue;
      } else {
        acc.equipmentValue += asset.currentValue;
      }
      return acc;
    }, { totalValue: 0, equipmentValue: 0, propertyValue: 0, totalMaintenance: 0 });

    return NextResponse.json({ assets, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const asset = await Asset.create(body);
    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
