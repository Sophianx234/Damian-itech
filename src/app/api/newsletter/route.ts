import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return NextResponse.json({ success: false, error: "You are already subscribed!" }, { status: 400 });
    }

    await Subscriber.create({ email });

    return NextResponse.json({ success: true, message: "Successfully subscribed to the newsletter!" }, { status: 201 });
  } catch (error: any) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
