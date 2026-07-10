import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Please provide both phone number and password' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    await createSession(user._id.toString(), user.role);

    const userResponse = {
      id: user._id.toString(),
      fullName: user.fullName,
      phone: user.phone,
      isVerified: user.isVerified,
      role: user.role,
    };

    return NextResponse.json(
      { success: true, message: 'Logged in successfully', user: userResponse },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
