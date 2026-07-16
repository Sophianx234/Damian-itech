import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import * as React from 'react';
import { render } from '@react-email/render';
import PasswordResetEmail from '@/components/email/PasswordResetEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email address is required." }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "No account associated with this email address." }, { status: 400 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    user.resetPasswordOTP = hashedOtp;
    user.resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    try {
      const emailHtml = await render(
        React.createElement(PasswordResetEmail, { userName: user.fullName, otpCode: otpCode })
      );

      const { error } = await resend.emails.send({
        from: 'Damian iTech <security@resend.dev>',
        to: [email],
        subject: 'Your Password Reset Code',
        html: emailHtml,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Email Service Error:", error);
      return NextResponse.json({ success: false, error: "Failed to send reset code. Please try again later." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully via email." });
  } catch (error: any) {
    console.error("Forgot Password Step 1 Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
