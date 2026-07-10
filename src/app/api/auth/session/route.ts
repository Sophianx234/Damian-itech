import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifySession(sessionToken);
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    await dbConnect();
    const user = await User.findById(payload.userId).select('fullName phone isVerified role');
    
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
      }
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
