import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({}); // Create default settings if none exist
    }

    // Convert to plain object so we can safely mutate it for the response
    let settingsObj = settings.toObject ? settings.toObject() : settings;

    // Dynamically disable flash sale if the product is out of stock
    if (settingsObj.flashSaleActive && settingsObj.flashSaleLink) {
      const slugMatch = settingsObj.flashSaleLink.match(/\/products\/([^\/]+)/);
      if (slugMatch && slugMatch[1]) {
        const slug = slugMatch[1];
        const product = await Product.findOne({ slug });
        if (product && product.stock <= 0) {
          settingsObj.flashSaleActive = false;
        }
      }
    }

    return NextResponse.json({ success: true, settings: settingsObj });
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
