import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifySession } from '@/lib/session';
import { hasPermission } from '@/lib/rbac';
import { orderSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const validatedBody = orderSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validatedBody.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { 
      items, 
      paymentMethod, 
      shippingDetails, 
      pickupLocation, 
      reference 
    } = validatedBody.data;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    const session = await verifySession(sessionToken);
    let userId = session?.userId;

    // Calculate total amount securely from database
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const productId = item.id || item.productId || item._id;
      const product = await Product.findById(productId);
      
      if (!product) {
        return NextResponse.json({ success: false, message: `Product not found` }, { status: 400 });
      }
      
      // Use the database price, ignoring the client's payload price
      const price = product.isSwappable ? (product.estValue || product.price) : product.price;
      totalAmount += price * item.quantity;

      validatedItems.push({
        productId: product._id,
        name: product.title,
        quantity: item.quantity,
        price: price, // Securely mapped
        image: item.image || product.images?.[0]
      });
    }

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
      items: validatedItems,
      totalAmount: finalTotal,
      deliveryFee,
      paymentMethod,
      paymentStatus,
      shippingDetails: paymentMethod !== 'pickup' ? shippingDetails : undefined,
      pickupLocation: paymentMethod === 'pickup' ? pickupLocation : undefined,
      paystackReference: reference,
    });

    // Update Product Inventory & Status
    for (const item of validatedItems) {
      const product = await Product.findById(item.productId);
      
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

    // Send WhatsApp notification
    if (shippingDetails?.phone) {
      let formattedPhone = shippingDetails.phone.replace(/\D/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "233" + formattedPhone.substring(1);
      }
      if (!formattedPhone.includes("@c.us")) {
        formattedPhone = `${formattedPhone}@c.us`;
      }

      const productNames = validatedItems.map((item: any) => `${item.quantity}x ${item.name}`).join(', ');

      let message = "";
      if (paymentMethod === 'pickup') {
        message = `Hello ${shippingDetails.fullName || 'Customer'}, your order for ${productNames} has been confirmed! Order ID: ${newOrder._id}. Please have your payment ready when you arrive at ${pickupLocation}. We will prepare your items shortly. Thank you for choosing Damian iTech!`;
      } else {
        message = `Hello ${shippingDetails.fullName || 'Customer'}, your payment for ${productNames} was successfully processed! Order ID: ${newOrder._id}. Your items will be dispatched to your location soon. Thank you for choosing Damian iTech!`;
      }

      try {
        const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const response = await fetch("http://localhost:3001/send-otp", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-api-key": process.env.WHATSAPP_MICROSERVICE_KEY || "",
            "x-forwarded-for": clientIp
          },
          body: JSON.stringify({ phone: formattedPhone, message }),
        });

        if (!response.ok) {
          console.error("WhatsApp Microservice returned an error:", response.statusText);
        }
      } catch (error) {
        console.error("WhatsApp Microservice Error:", error);
      }
    }

    return NextResponse.json({ success: true, orderId: newOrder._id });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // RBAC: Verify admin session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    const session = await verifySession(sessionToken);
    
    
    if (!session || !hasPermission(session.role as string, 'access_page', '/admin/orders')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
