import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdminInvitation from "@/models/AdminInvitation";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { inviteId, otp } = await req.json();

    if (!inviteId || !otp) {
      return NextResponse.json({ success: false, error: "Invite ID and OTP are required." }, { status: 400 });
    }

    const invite = await AdminInvitation.findById(inviteId);
    if (!invite) {
      return NextResponse.json({ success: false, error: "Invitation not found." }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ success: false, error: "Invitation has already been used or cancelled." }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ success: false, error: "Invitation has expired." }, { status: 400 });
    }

    if (invite.otp !== otp) {
      return NextResponse.json({ success: false, error: "Invalid OTP code." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "OTP verified." });
  } catch (error: any) {
    console.error("Verify Admin Invite Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
