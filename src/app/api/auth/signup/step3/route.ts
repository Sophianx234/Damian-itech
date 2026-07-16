import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';
import { signupStep3Schema } from '@/lib/validations';
import { Resend } from 'resend';
import * as React from 'react';
import { render } from '@react-email/render';
import WelcomeMail from '@/components/email/WelcomeMail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const validatedBody = signupStep3Schema.safeParse(body);
    
    if (!validatedBody.success) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        errors: validatedBody.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { email, password } = validatedBody.data;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 400 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ success: false, error: "User email address is not verified." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    try {
      const emailHtml = await render(
        React.createElement(WelcomeMail, { userName: user.fullName })
      );

      await resend.emails.send({
        from: 'Damian iTech <welcome@resend.dev>',
        to: [email],
        subject: 'Welcome to Damian iTech!',
        html: emailHtml,
      });
    } catch (e) {
      console.error("Welcome message dispatch error:", e);
    }

    await createSession(user._id.toString(), user.role);

    return NextResponse.json({
      success: true,
      message: "Account created and password set successfully.",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error("Signup Step 3 Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
