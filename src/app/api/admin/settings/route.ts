import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

export async function GET() {
  try {
    await dbConnect();
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({}); // Create default settings if none exist
    }
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Get Settings Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create(data);
    } else {
      settings = await StoreSettings.findOneAndUpdate({}, data, { new: true });
    }

    return NextResponse.json({ success: true, settings, message: "Settings updated successfully" });
  } catch (error: any) {
    console.error("Update Settings Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
