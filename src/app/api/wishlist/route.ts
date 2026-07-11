import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const payload = await verifySession(sessionToken);
    if (!payload) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const user = await User.findById(payload.userId).populate('wishlist');
    
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: user.wishlist });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const payload = await verifySession(sessionToken);
    if (!payload) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ success: false, error: "Missing productId" }, { status: 400 });

    await dbConnect();
    const user = await User.findById(payload.userId);
    
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    // Toggle logic
    const index = user.wishlist.findIndex((id: any) => id.toString() === productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    return NextResponse.json({ success: true, isWishlisted: index === -1 });
  } catch (error) {
    console.error("Update wishlist error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
