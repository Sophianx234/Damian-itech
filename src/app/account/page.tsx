import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/session';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import AccountClient from './AccountClient';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'My Account - Damian iTech',
  description: 'Manage your Damian iTech account and view orders.',
};

export default async function AccountPage() {
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
  
  const user = await User.findById(payload.userId).lean();
  if (!user) {
    redirect('/login');
  }

  // Fetch orders
  const orders = await Order.find({ user: payload.userId }).sort({ createdAt: -1 }).lean();

  // Serialize user
  const serializedUser = {
    id: user._id.toString(),
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
  };

  // Serialize orders
  const serializedOrders = orders.map((order: any) => ({
    id: order._id.toString(),
    totalAmount: order.totalAmount,
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
      <Header />
      <AccountClient user={serializedUser} orders={serializedOrders} />
      <Footer />
    </>
  );
}
