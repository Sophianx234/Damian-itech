import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdminInvitation from "@/models/AdminInvitation";
import User from "@/models/User";

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { fullName, phone, role } = await req.json();

    if (!fullName || !phone || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser && existingUser.role !== "User") {
      return NextResponse.json(
        { success: false, error: "A user with this phone number is already an admin or staff member." },
        { status: 400 }
      );
    }

    // Delete any existing pending invitations for this phone to start fresh
    await AdminInvitation.deleteMany({ phone, status: "pending" });

    const otp = generateOTP();
    // Expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const invite = await AdminInvitation.create({
      fullName,
      phone,
      role,
      otp,
      expiresAt,
    });

    // Simulate sending a WhatsApp message
    const message = `Hello ${fullName}, you've been invited to join the Damian iTech admin team as a ${role}.\n\nYour verification code is: ${otp}\n\nPlease click the link below to accept the invitation and set up your password:\n\nhttp://localhost:3000/admin-accept-invite?inviteId=${invite._id}`;
    
    // In a real app, integrate with Twilio or WhatsApp Business API here.
    console.log("========== WHATSAPP SIMULATION ==========");
    console.log(`To: ${phone}`);
    console.log(message);
    console.log("=========================================");

    return NextResponse.json({ success: true, message: "Invitation sent successfully." });
  } catch (error: any) {
    console.error("Invite Admin Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
