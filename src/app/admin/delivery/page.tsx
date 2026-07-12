import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import DeliveryDashboard from "./DeliveryDashboard";

export default async function AdminDeliveryPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) redirect("/login");

  const payload = await verifySession(sessionToken);
  if (!payload) redirect("/login");

  await dbConnect();
  const user = await User.findById(payload.userId).lean();
  
  /* if (!user || (user.role !== "admin" && user.role !== "manager" && user.role !== "rider" && user.role !== "delivery")) {
    redirect("/");
  } */

  // Fetch orders that are processing or shipped (ready for delivery)
  // or maybe all orders for the admin to assign. 
  // For the rider, we fetch orders that are meant to be delivered.
  const orders = await Order.find({
    paymentMethod: { $ne: "pickup" },
    orderStatus: { $in: ["processing", "shipped", "delivered"] }
  })
    .sort({ createdAt: -1 })
    .lean();

  const serializedOrders = orders.map((order: any) => ({
    _id: order._id.toString(),
    totalAmount: order.totalAmount,
    deliveryFee: order.deliveryFee,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    shippingDetails: order.shippingDetails,
    items: order.items,
    createdAt: order.createdAt?.toISOString(),
  }));

  return <DeliveryDashboard initialOrders={serializedOrders} />;
}
