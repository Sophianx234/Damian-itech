import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/session';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import ReceiptClient from './ReceiptClient';

export const metadata = {
  title: 'Order Receipt - Damian iTech',
  description: 'Your Damian iTech order receipt.',
};

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  
  // Resolve params
  const resolvedParams = await params;
  
  // Fetch specific order for the logged-in user
  const order = await Order.findOne({ 
    _id: resolvedParams.id, 
    user: payload.userId 
  }).lean();

  if (!order) {
    redirect('/orders'); // Redirect to orders if not found or unauthorized
  }

  // Serialize order for Client Component
  const serializedOrder = {
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
    })),
    shippingDetails: order.shippingDetails ? {
      fullName: order.shippingDetails.fullName,
      phone: order.shippingDetails.phone,
      streetAddress: order.shippingDetails.streetAddress,
      region: order.shippingDetails.region,
    } : null,
    pickupLocation: order.pickupLocation,
  };

  return <ReceiptClient order={serializedOrder} />;
}
