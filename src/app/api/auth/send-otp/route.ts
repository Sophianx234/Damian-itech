import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    await dbConnect();

    // Check if user exists before sending OTP
    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ error: 'No account associated with this phone number' }, { status: 404 });
    }

    // 1. Generate a secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Hash OTP and store securely in the User document with a 5-minute expiration
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    user.resetPasswordOTP = hashedOtp;
    user.resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    // 3. Format phone number for WhatsApp (@c.us)
    // Assuming the phone number is provided correctly, if it has a leading 0, replace with country code or keep as is if user provides full number.
    // Assuming user phone is something like +233... or 233...
    // Let's strip any non-digit characters
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '233' + formattedPhone.substring(1);
    }
    
    // Simple check: if it starts with 0, you might need to append country code. 
    // Usually WhatsApp requires country code without '+'.
    // Here we'll just append @c.us as requested.
    if (!formattedPhone.includes('@c.us')) {
      formattedPhone = `${formattedPhone}@c.us`;
    }

    const message = `Your TechNest password reset code is ${otpCode}. It is valid for 5 minutes. Do not share this code with anyone.`;

    // 4. Send WhatsApp message using the local microservice
    try {
      const response = await fetch('http://localhost:3001/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Microservice returned an error');
      }
    } catch (microserviceError) {
      console.error('WhatsApp Microservice Error:', microserviceError);
      return NextResponse.json({ error: 'Our notification service is currently down. Please try again later.' }, { status: 503 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully via WhatsApp' }, { status: 200 });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
