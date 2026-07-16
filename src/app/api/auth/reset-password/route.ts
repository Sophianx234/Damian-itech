import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';
import { resetPasswordSchema } from '@/lib/validations';
import { Resend } from 'resend';
import * as React from 'react';
import { render } from '@react-email/render';
import PasswordChangedEmail from '@/components/email/PasswordChangedEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const validatedBody = resetPasswordSchema.safeParse(body);
    
    if (!validatedBody.success) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        errors: validatedBody.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { email, otp, password } = validatedBody.data;

    const user = await User.findOne({ email });
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

    try {
      const emailHtml = await render(
        React.createElement(PasswordChangedEmail, { userName: user.fullName })
      );

      await resend.emails.send({
        from: 'Damian iTech <security@resend.dev>',
        to: [email],
        subject: 'Your Password Has Been Changed',
        html: emailHtml,
      });
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
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
