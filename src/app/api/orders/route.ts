import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifySession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { 
      items, 
      paymentMethod, 
      shippingDetails, 
      pickupLocation, 
      reference 
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    const session = await verifySession(sessionToken);
    let userId = session?.userId;

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : item.price;
      return sum + (price * item.quantity);
    }, 0);

    const deliveryFee = paymentMethod === 'pickup' ? 0 : (shippingDetails?.region === "Greater Accra" ? 20 : 50);
    const finalTotal = totalAmount + deliveryFee;

    let paymentStatus = "pending";

    // Verify Paystack Payment if applicable
    if (paymentMethod === 'paystack') {
      if (!reference) {
        return NextResponse.json({ success: false, message: 'Paystack reference required' }, { status: 400 });
      }

      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) {
        throw new Error('Server configuration error: Paystack key missing');
      }

      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!data.status || data.data.status !== 'success') {
        return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
      }
      
      // Paystack returns amount in pesewas
      const amountPaid = data.data.amount / 100;
      if (amountPaid < finalTotal) {
         return NextResponse.json({ success: false, message: 'Payment amount mismatch. Please contact support.' }, { status: 400 });
      }

      paymentStatus = "paid";
    }

    // Create Order
    const newOrder = await Order.create({
      user: userId,
      guestEmail: !userId ? shippingDetails?.email : undefined,
      items: items.map((item: any) => ({
        productId: item.id || item.productId || item._id,
        name: item.name,
        quantity: item.quantity,
        price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : item.price,
        image: item.image
      })),
      totalAmount: finalTotal,
      deliveryFee,
      paymentMethod,
      paymentStatus,
      shippingDetails: paymentMethod !== 'pickup' ? shippingDetails : undefined,
      pickupLocation: paymentMethod === 'pickup' ? pickupLocation : undefined,
      paystackReference: reference,
    });

    // Update Product Inventory & Status
    for (const item of items) {
      const productId = item.id || item.productId || item._id;
      const product = await Product.findById(productId);
      
      if (product) {
        // Decrement stock, ensuring it doesn't drop below 0
        product.stock = Math.max(0, product.stock - item.quantity);
        
        // If stock is completely depleted, update the status
        if (product.stock === 0) {
          if (paymentMethod === 'paystack') {
            product.status = 'Sold';
          } else {
            product.status = 'Reserved'; // For pickup or delivery
          }
        }
        
        await product.save();
      }
    }

    return NextResponse.json({ success: true, orderId: newOrder._id });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}
