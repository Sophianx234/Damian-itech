import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    // Fetch users with admin or manager or support role
    const teamMembers = await User.find({ role: { $in: ["admin", "manager", "support"] } }).select("fullName email phone role");
    return NextResponse.json({ success: true, teamMembers });
  } catch (error: any) {
    console.error("Get Team Members Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
