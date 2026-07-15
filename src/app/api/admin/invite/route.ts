import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AdminInvitation from "@/models/AdminInvitation";
import User from "@/models/User";
import { inviteSchema } from "@/lib/validations";

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const validatedBody = inviteSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validatedBody.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, phone, role } = validatedBody.data;

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

    // Format phone number for WhatsApp
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "233" + formattedPhone.substring(1);
    }
    if (!formattedPhone.includes("@c.us")) {
      formattedPhone = `${formattedPhone}@c.us`;
    }

    const message = `Hello ${fullName}, you've been invited to join the Damian iTech admin team as a ${role}.\n\nYour verification code is: ${otp}\n\nPlease click the link below to accept the invitation and set up your password:\n\nhttp://localhost:3000/admin-accept-invite?inviteId=${invite._id}`;
    
    // Send to WhatsApp microservice
    try {
      const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
      const response = await fetch(`${process.env.WHATSAPP_MICROSERVICE_URL || "http://localhost:3001"}/send-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": process.env.WHATSAPP_MICROSERVICE_KEY || "",
          "x-forwarded-for": clientIp
        },
        body: JSON.stringify({ phone: formattedPhone, message }),
      });

      if (!response.ok) {
        throw new Error("Microservice returned an error");
      }
    } catch (error) {
      console.error("WhatsApp Microservice Error:", error);
      return NextResponse.json({ success: false, error: "Failed to send WhatsApp message. Please ensure the notification service is running." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Invitation sent successfully via WhatsApp." });
  } catch (error: any) {
    console.error("Invite Admin Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
