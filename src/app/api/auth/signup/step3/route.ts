import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';
import { signupStep3Schema } from '@/lib/validations';

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

    const { phone, password } = validatedBody.data;

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 400 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ success: false, error: "User phone number is not verified." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "233" + formattedPhone.substring(1);
    }
    if (!formattedPhone.includes("@c.us")) {
      formattedPhone = `${formattedPhone}@c.us`;
    }
    const welcomeMessage = `Akwaaba ${user.fullName.split(" ")[0]}, welcome to Damian iTech! 🎉\n\nYour account has been successfully created. We're thrilled to have you on board. You can now start exploring and shopping the best latest gadgets at affordable prices!\n\nSee the latest tech products: ${process.env.WEBSITE_LINK}`;

    try {
      fetch("http://localhost:3001/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, message: welcomeMessage }),
      }).catch((err) => console.error("Failed to send welcome message:", err));
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
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error("Signup Step 3 Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
