import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/session';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import OrdersClient from './OrdersClient';



export const metadata = {
  title: 'Your Orders - Damian iTech',
  description: 'Track and manage your orders at Damian iTech.',
};

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  
  if (!sessionToken) {
    redirect('/login');
  }

  const payload = await verifySession(sessionToken);
  if (!payload) {
    redirect('/login');
  }

  await dbConnect();
  
  // Fetch orders for the logged-in user
  const orders = await Order.find({ user: payload.userId }).sort({ createdAt: -1 }).lean();

  // Serialize orders for Client Component
  const serializedOrders = orders.map((order: any) => ({
    id: order._id.toString(),
    totalAmount: order.totalAmount,
    deliveryFee: order.deliveryFee || 0,
    status: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
    items: order.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }))
  }));

  return (
    <>
      <OrdersClient orders={serializedOrders} />
      </>
  );
}
