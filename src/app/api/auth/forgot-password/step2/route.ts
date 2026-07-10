import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ success: false, error: "Phone and OTP are required." }, { status: 400 });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 400 });
    }

    if (!user.resetPasswordOTP || !user.resetPasswordExpires) {
      return NextResponse.json({ success: false, error: "No verification code requested or it has expired." }, { status: 400 });
    }

    if (user.resetPasswordExpires < new Date()) {
      return NextResponse.json({ success: false, error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid verification code." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Phone number verified successfully. You can now reset your password." });
  } catch (error: any) {
    console.error("Forgot Password Step 2 Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
