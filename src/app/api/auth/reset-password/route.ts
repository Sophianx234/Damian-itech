import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { phone, otp, password } = await request.json();

    if (!phone || !otp || !password) {
      return NextResponse.json({ error: 'Phone, OTP, and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await dbConnect();

    // 1. Verify OTP exists and is valid
    const otpRecord = await OTP.findOne({ phone });
    if (!otpRecord) {
      return NextResponse.json({ error: 'Verification code has expired or does not exist. Please request a new one.' }, { status: 400 });
    }

    // Compare provided OTP with hashed OTP in database
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // 2. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Update User's password
    const user = await User.findOneAndUpdate(
      { phone },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Delete the used OTP record to prevent reuse
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({ success: true, message: 'Password reset successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
