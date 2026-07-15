import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AdminInvitation from "@/models/AdminInvitation";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { inviteSetupSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const validatedBody = inviteSetupSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        errors: validatedBody.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { inviteId, otp, password } = validatedBody.data;

    const invite = await AdminInvitation.findById(inviteId);
    if (!invite) {
      return NextResponse.json({ success: false, error: "Invitation not found." }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ success: false, error: "Invitation has already been used." }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ success: false, error: "Invitation has expired." }, { status: 400 });
    }

    if (invite.otp !== otp) {
      return NextResponse.json({ success: false, error: "Invalid OTP code." }, { status: 400 });
    }

    // Set password and create/update user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = await User.findOne({ phone: invite.phone });
    if (user) {
      user.password = hashedPassword;
      user.role = invite.role;
      user.fullName = invite.fullName; // update name just in case
      await user.save();
    } else {
      user = await User.create({
        fullName: invite.fullName,
        phone: invite.phone,
        password: hashedPassword,
        role: invite.role,
      });
    }

    invite.status = "accepted";
    await invite.save();

    return NextResponse.json({ success: true, message: "Password set successfully. You can now log in." });
  } catch (error: any) {
    console.error("Setup Admin Password Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
