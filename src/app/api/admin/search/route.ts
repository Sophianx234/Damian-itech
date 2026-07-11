import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: { products: [], orders: [], users: [] } });
    }

    const regex = new RegExp(q, "i");

    // 1. Search Products
    const products = await Product.find({
      $or: [
        { title: regex },
        { brand: regex },
        { category: regex }
      ]
    }).select("title price stock category image").limit(4).lean();

    // 2. Search Orders
    const orderQuery: any = {
      $or: [
        { guestEmail: regex },
        { "shippingDetails.email": regex },
        { "shippingDetails.fullName": regex },
        { paystackReference: regex }
      ]
    };

    // If search term looks like a Mongo ID, add it to the search
    if (mongoose.Types.ObjectId.isValid(q)) {
      orderQuery.$or.push({ _id: q });
    }

    const orders = await Order.find(orderQuery)
      .select("_id totalAmount orderStatus createdAt shippingDetails guestEmail")
      .limit(4)
      .lean();

    // 3. Search Users
    const users = await User.find({
      $or: [
        { fullName: regex },
        { email: regex }
      ]
    }).select("fullName email role").limit(4).lean();

    return NextResponse.json({
      success: true,
      data: {
        products,
        orders,
        users
      }
    });

  } catch (error) {
    console.error("Omni-search error:", error);
    return NextResponse.json({ success: false, error: "Failed to search" }, { status: 500 });
  }
}
