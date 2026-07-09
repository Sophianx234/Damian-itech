import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

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

    // Find user by phone number
    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Check if the password matches the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Exclude password from the returned object
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      phone: user.phone,
    };

    // INDUSTRY STANDARD NOTE: 
    // Typically, you would generate a JWT token here and set it as an HTTP-only cookie
    // e.g. cookies().set('auth-token', token, { httpOnly: true, secure: true })
    
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
