import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP are required." }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 400 });
    }

    if (!user.signupOTP || !user.signupOTPExpires) {
      return NextResponse.json({ success: false, error: "No verification code requested." }, { status: 400 });
    }

    if (user.signupOTPExpires < new Date()) {
      return NextResponse.json({ success: false, error: "Verification code has expired. Please go back and request a new one." }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(otp, user.signupOTP);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid verification code." }, { status: 400 });
    }

    user.isVerified = true;
    user.signupOTP = undefined;
    user.signupOTPExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Email verified successfully." });
  } catch (error: any) {
    console.error("Signup Step 2 Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
