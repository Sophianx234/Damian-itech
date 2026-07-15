import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const id = (await params).id;
    const body = await request.json();

    const order = await Order.findByIdAndUpdate(id, body, { new: true });
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Send WhatsApp notification if status changed to delivered
    if (body.orderStatus === 'delivered' && order.shippingDetails?.phone) {
      let formattedPhone = order.shippingDetails.phone.replace(/\D/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "233" + formattedPhone.substring(1);
      }
      if (!formattedPhone.includes("@c.us")) {
        formattedPhone = `${formattedPhone}@c.us`;
      }

      const productNames = order.items && order.items.length > 0 
        ? order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')
        : "your items";

      const message = `Hello ${order.shippingDetails.fullName || 'Customer'}! Your Damian iTech order containing:\n*${productNames}*\n\n(Order #${order._id.toString().slice(-8).toUpperCase()}) has just been successfully delivered to your location! 🎉\n\nThank you for shopping with us. We hope you enjoy your purchase!`;

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

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error("Order update error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const id = (await params).id;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error("Order delete error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
