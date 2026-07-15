import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    // We expect { isSuspended: boolean } in the body
    const body = await request.json();
    const { isSuspended } = body;
    
    if (typeof isSuspended !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Invalid suspension status' }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    // Admin cannot suspend another admin
    if (user.role === 'admin') {
      return NextResponse.json({ success: false, message: 'Cannot suspend an admin user' }, { status: 403 });
    }

    user.isSuspended = isSuspended;
    await user.save();

    return NextResponse.json({ success: true, message: `User successfully ${isSuspended ? 'suspended' : 'unsuspended'}` });
  } catch (error: any) {
    console.error("Suspend user error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
