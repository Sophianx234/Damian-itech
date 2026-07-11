import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json({ success: false, error: "Team member not found" }, { status: 404 });
    }

    // Instead of deleting the user, we just revert their role to "user" so they lose admin privileges
    userToUpdate.role = "user";
    await userToUpdate.save();

    return NextResponse.json({ success: true, message: "Team member removed successfully" });
  } catch (error: any) {
    console.error("Remove Team Member Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
