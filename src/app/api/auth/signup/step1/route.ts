import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signupSchema } from '@/lib/validations';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const { fullName, email, phone } = validatedBody.data;

    let user = await User.findOne({ $or: [{ phone }, { email }] });
    if (user && user.isVerified) {
      return NextResponse.json({ success: false, error: "An account with this email or phone number already exists and is verified." }, { status: 400 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    if (user) {
      user.fullName = fullName;
      user.email = email;
      user.phoneNumber = phone;
      user.signupOTP = hashedOtp;
      user.signupOTPExpires = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();
    } else {
      user = await User.create({
        fullName,
        email,
        phone,
        phoneNumber: phone,
        isVerified: false,
        signupOTP: hashedOtp,
        signupOTPExpires: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    try {
      const { error } = await resend.emails.send({
        from: 'Damian iTech <onboarding@resend.dev>',
        to: [email],
        subject: 'Your Verification Code',
        html: `<p>Your verification code is <strong>${otpCode}</strong></p>`,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Resend Email Error:", error);
      return NextResponse.json({ success: false, error: "Failed to send verification email. Please try again later." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Verification code sent via Email." });
  } catch (error: any) {
    console.error("Signup Step 1 Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
