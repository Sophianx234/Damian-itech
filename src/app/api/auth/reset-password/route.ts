import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { phone, otp, password } = await request.json();

    if (!phone || !otp || !password) {
      return NextResponse.json({ success: false, error: "Phone, OTP, and new password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters." }, { status: 400 });
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "233" + formattedPhone.substring(1);
    }
    if (!formattedPhone.includes("@c.us")) {
      formattedPhone = `${formattedPhone}@c.us`;
    }

    const resetMessage = `Hi ${user.fullName.split(" ")[0]}, your Damian iTech account password has been successfully reset! 🔒\n\nIf you did not make this change, please contact our support team immediately.\n\nContinue shopping: ${process.env.WEBSITE_LINK}`;

    try {
      fetch("http://localhost:3001/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, message: resetMessage }),
      }).catch(err => console.error("Failed to send reset confirmation:", err));
    } catch (e) {
      console.error("Reset confirmation dispatch error:", e);
    }

    await createSession(user._id.toString(), user.role);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
