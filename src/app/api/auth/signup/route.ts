import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, password } = body;

    // 1. Basic validation
    if (!fullName || !phone || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields (fullName, phone, password)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // 2. Connect to Database
    await dbConnect();

    // 3. Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists' },
        { status: 409 }
      );
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create user in database
    const newUser = await User.create({
      fullName,
      phone,
      password: hashedPassword,
    });

    // Strip password from the response object
    const userResponse = {
      _id: newUser._id,
      fullName: newUser.fullName,
      phone: newUser.phone,
    };

    return NextResponse.json(
      { success: true, message: 'Account created successfully', user: userResponse },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
