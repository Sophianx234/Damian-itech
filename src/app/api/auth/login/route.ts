import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createSession } from '@/lib/session';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedBody = loginSchema.safeParse({ identifier: body.phone, password: body.password });

    if (!validatedBody.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed', 
          errors: validatedBody.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { identifier: phone, password } = validatedBody.data;

    await dbConnect();

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

    if (user.lockUntil && user.lockUntil > new Date()) {
      const minsLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account locked due to too many failed attempts. Try again in ${minsLeft} minutes.` },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      }
      await user.save();
      
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
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
