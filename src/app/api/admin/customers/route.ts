import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch registered users (role: user)
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 }).lean();
    
    // For each user, calculate total orders and total spent
    const registeredCustomers = await Promise.all(users.map(async (user) => {
      const orders = await Order.find({ user: user._id });
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      return {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended || false,
        createdAt: user.createdAt,
        totalOrders,
        totalSpent,
        isGuest: false,
        orders: orders
      };
    }));
    
    // Add guest customers from orders
    const guestOrders = await Order.find({ user: { $exists: false } }).lean();
    
    const guestMap = new Map();
    guestOrders.forEach(order => {
      const email = order.guestEmail || order.shippingDetails?.email;
      const phone = order.shippingDetails?.phone;
      const name = order.shippingDetails?.fullName || 'Guest';
      
      // Use phone or email as a unique identifier for guests
      const key = phone || email || order._id.toString();
      
      if (!guestMap.has(key)) {
        guestMap.set(key, {
          id: key,
          fullName: name,
          phone: phone || 'N/A',
          email: email || 'N/A',
          isVerified: false,
          isSuspended: false,
          createdAt: order.createdAt,
          totalOrders: 0,
          totalSpent: 0,
          isGuest: true,
          orders: []
        });
      }
      
      const guest = guestMap.get(key);
      guest.totalOrders += 1;
      guest.totalSpent += order.totalAmount;
      guest.orders.push(order);
    });

    const allCustomers = [...registeredCustomers, ...Array.from(guestMap.values())]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: allCustomers });
  } catch (error: any) {
    console.error("Fetch customers error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
