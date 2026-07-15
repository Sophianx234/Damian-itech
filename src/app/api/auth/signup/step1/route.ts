import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signupSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const validatedBody = signupSchema.safeParse(body);
    
    if (!validatedBody.success) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        errors: validatedBody.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { fullName, phone } = validatedBody.data;

    let user = await User.findOne({ phone });
    if (user && user.isVerified) {
      return NextResponse.json({ success: false, error: "An account with this phone number already exists and is verified." }, { status: 400 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    if (user) {
      user.fullName = fullName;
      user.signupOTP = hashedOtp;
      user.signupOTPExpires = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();
    } else {
      user = await User.create({
        fullName,
        phone,
        isVerified: false,
        signupOTP: hashedOtp,
        signupOTPExpires: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "233" + formattedPhone.substring(1);
    }
    if (!formattedPhone.includes("@c.us")) {
      formattedPhone = `${formattedPhone}@c.us`;
    }

    const message = `Your Damian iTech signup verification code is ${otpCode}. It is valid for 5 minutes. Do not share this code with anyone.`;

    try {
      const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
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
      return NextResponse.json({ success: false, error: "Failed to send WhatsApp verification message. Please ensure the microservice is running." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Verification code sent via WhatsApp." });
  } catch (error: any) {
    console.error("Signup Step 1 Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
