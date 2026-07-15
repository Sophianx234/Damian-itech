import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ success: false, error: "No account associated with this phone number." }, { status: 400 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    user.resetPasswordOTP = hashedOtp;
    user.resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "233" + formattedPhone.substring(1);
    }
    if (!formattedPhone.includes("@c.us")) {
      formattedPhone = `${formattedPhone}@c.us`;
    }

    const message = `Your Damian iTech password reset code is ${otpCode}. It is valid for 5 minutes. Do not share this code with anyone.`;

    try {
      const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const response = await fetch("http://localhost:3001/send-otp", {
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

    return NextResponse.json({ success: true, message: "OTP sent successfully via WhatsApp." });
  } catch (error: any) {
    console.error("Forgot Password Step 1 Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
