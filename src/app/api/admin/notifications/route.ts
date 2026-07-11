import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch pending orders
    const pendingOrders = await Order.find({ orderStatus: 'pending' }).sort({ createdAt: -1 });
    
    // Fetch low stock products (e.g. stock <= 5)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 });

    const notifications = [];

    // Add order notifications
    pendingOrders.forEach(order => {
      notifications.push({
        id: `order-${order._id}`,
        type: 'order',
        title: 'New Pending Order',
        message: `Order #${order._id.toString().slice(-6).toUpperCase()} is waiting to be processed.`,
        time: order.createdAt,
        link: '/admin/orders',
        isCritical: false
      });
    });

    // Add stock notifications
    lowStockProducts.forEach(product => {
      notifications.push({
        id: `stock-${product._id}`,
        type: 'stock',
        title: 'Low Stock Alert',
        message: `${product.name} is running low on stock (${product.stock} left).`,
        time: product.updatedAt || new Date(),
        link: '/admin/products',
        isCritical: product.stock === 0
      });
    });

    // Sort all notifications by time (newest first)
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error("Failed to fetch notifications", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
