import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch pending orders
    const pendingOrders = await Order.find({ orderStatus: 'pending' }).sort({ createdAt: -1 });
    // Fetch low stock products
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 });

    const pendingOrderIds = pendingOrders.map(o => o._id.toString());
    const lowStockProductIds = lowStockProducts.map(p => p._id.toString());

    // 1. Delete notifications for things that are no longer pending/low stock
    await Notification.deleteMany({ type: 'order', referenceId: { $nin: pendingOrderIds } });
    await Notification.deleteMany({ type: 'stock', referenceId: { $nin: lowStockProductIds } });

    // 2. Upsert notifications for current pending orders
    for (const order of pendingOrders) {
      await Notification.updateOne(
        { type: 'order', referenceId: order._id.toString() },
        { 
          $setOnInsert: {
            title: 'New Pending Order',
            message: `Order #${order._id.toString().slice(-6).toUpperCase()} is waiting to be processed.`,
            link: '/admin/orders',
            isCritical: false
          }
        },
        { upsert: true }
      );
    }

    // 3. Upsert notifications for low stock products
    for (const product of lowStockProducts) {
      await Notification.updateOne(
        { type: 'stock', referenceId: product._id.toString() },
        { 
          $setOnInsert: {
            title: 'Low Stock Alert',
            message: `${product.name} is running low on stock (${product.stock} left).`,
            link: '/admin/products',
            isCritical: product.stock === 0
          }
        },
        { upsert: true }
      );
    }

    // 4. Fetch all active (not dismissed) notifications
    const activeNotifications = await Notification.find({ isDismissed: false }).sort({ createdAt: -1 });

    const formatted = activeNotifications.map(n => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      time: n.createdAt,
      link: n.link,
      isCritical: n.isCritical,
      isRead: n.isRead,
      isDismissed: n.isDismissed
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Failed to fetch notifications", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { action, notificationId } = body; // action: 'mark_read', 'dismiss', 'clear_all', 'mark_all_read'

    if (action === 'mark_read') {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    } else if (action === 'dismiss') {
      await Notification.findByIdAndUpdate(notificationId, { isDismissed: true });
    } else if (action === 'clear_all') {
      await Notification.updateMany({ isDismissed: false }, { isDismissed: true });
    } else if (action === 'mark_all_read') {
      await Notification.updateMany({ isRead: false }, { isRead: true });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
