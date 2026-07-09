import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
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

    // 2. Hash OTP and store in DB for industry-standard security
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    // Delete any existing OTPs for this phone to prevent conflicts
    await OTP.deleteMany({ phone });

    // Save new OTP
    await OTP.create({
      phone,
      otp: hashedOtp,
    });

    // 3. Fetch Arkesel API Key
    const arkeselApiKey = process.env.ARKESEL_API_KEY;
    
    if (!arkeselApiKey) {
      console.error('ARKESEL_API_KEY is missing from environment variables');
      return NextResponse.json({ error: 'Server SMS configuration error' }, { status: 500 });
    }

    // 4. Send SMS using Arkesel v2 API
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': arkeselApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: 'TechNest', // Must be an approved Sender ID on Arkesel (max 11 chars)
        message: `Your TechNest password reset code is ${otpCode}. It is valid for 10 minutes. Do not share this code with anyone.`,
        recipients: [phone]
      })
    });

    const data = await response.json();

    // Handle Arkesel Response
    if (!response.ok || data.status === 'error') {
      console.error('Arkesel API Error:', data);
      return NextResponse.json({ error: 'Failed to send SMS to this number' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
