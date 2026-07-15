import React from "react";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import OrdersClientView from "./OrdersClientView";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function AdminOrdersPage(props: Props) {
  await dbConnect();
  
  const searchParams = await props.searchParams;

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const orderStatusFilter = typeof searchParams.orderStatus === "string" ? searchParams.orderStatus : "";
  const paymentStatusFilter = typeof searchParams.paymentStatus === "string" ? searchParams.paymentStatus : "";
  const paymentMethodFilter = typeof searchParams.paymentMethod === "string" ? searchParams.paymentMethod : "";

  const limit = 15;
  const query: any = {};

  if (search) {
    query.$or = [
      { _id: { $regex: search, $options: "i" } },
      { "shippingDetails.fullName": { $regex: search, $options: "i" } },
      { guestEmail: { $regex: search, $options: "i" } },
    ];
  }
  
  if (orderStatusFilter) query.orderStatus = orderStatusFilter;
  if (paymentStatusFilter) query.paymentStatus = paymentStatusFilter;
  if (paymentMethodFilter) query.paymentMethod = paymentMethodFilter;

  const totalOrdersCount = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalOrdersCount / limit) || 1;

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
    
  const formattedOrders = orders.map((o: any) => ({
    id: o._id.toString(),
    guestEmail: o.guestEmail,
    items: o.items.map((i: any) => ({
      productId: i.product?.toString() || i.productId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      image: i.image
    })),
    totalAmount: o.totalAmount,
    deliveryFee: o.deliveryFee,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    shippingDetails: o.shippingDetails,
    pickupLocation: o.pickupLocation,
    paystackReference: o.paystackReference,
    createdAt: new Date(o.createdAt).toLocaleString(),
  }));

  return (
    <OrdersClientView 
      initialOrders={formattedOrders} 
      totalPages={totalPages} 
      currentPage={page} 
    />
  );
}
