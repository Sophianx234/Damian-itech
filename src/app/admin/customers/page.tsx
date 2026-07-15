import React from "react";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import CustomersClientView from "./CustomersClientView";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function AdminCustomersPage(props: Props) {
  await dbConnect();
  
  const searchParams = await props.searchParams;

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const typeFilter = typeof searchParams.type === "string" ? searchParams.type : "";
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : "";
  const sortBy = typeof searchParams.sort === "string" ? searchParams.sort : "newest";

  const limit = 15;

  // Fetch registered users
  const users = await User.find({ role: 'user' }).lean();
  
  // Calculate total orders and total spent for registered users
  const registeredCustomers = await Promise.all(users.map(async (user: any) => {
    const orders = await Order.find({ user: user._id }).lean();
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      isVerified: user.isVerified,
      isSuspended: user.isSuspended || false,
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      rawDate: new Date(user.createdAt).getTime(),
      totalOrders,
      totalSpent,
      isGuest: false,
      orders: JSON.parse(JSON.stringify(orders))
    };
  }));
  
  // Add guest customers from orders
  const guestOrders = await Order.find({ user: { $exists: false } }).lean();
  
  const guestMap = new Map();
  guestOrders.forEach(order => {
    const email = order.guestEmail || order.shippingDetails?.email;
    const phone = order.shippingDetails?.phone;
    const name = order.shippingDetails?.fullName || 'Guest';
    
    const key = phone || email || order._id.toString();
    
    if (!guestMap.has(key)) {
      guestMap.set(key, {
        id: key,
        fullName: name,
        phone: phone || 'N/A',
        email: email || 'N/A',
        isVerified: false,
        isSuspended: false,
        createdAt: new Date(order.createdAt).toLocaleDateString(),
        rawDate: new Date(order.createdAt).getTime(),
        totalOrders: 0,
        totalSpent: 0,
        isGuest: true,
        orders: []
      });
    }
    
    const guest = guestMap.get(key);
    guest.totalOrders += 1;
    guest.totalSpent += order.totalAmount;
    guest.orders.push(JSON.parse(JSON.stringify(order)));
  });

  let allCustomers = [...registeredCustomers, ...Array.from(guestMap.values())];

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    allCustomers = allCustomers.filter(c => 
      (c.fullName && c.fullName.toLowerCase().includes(searchLower)) || 
      (c.phone && c.phone.toLowerCase().includes(searchLower)) ||
      (c.email && c.email.toLowerCase().includes(searchLower))
    );
  }

  if (typeFilter) {
    const isGuest = typeFilter === "guest";
    allCustomers = allCustomers.filter(c => c.isGuest === isGuest);
  }

  if (statusFilter) {
    const isSuspended = statusFilter === "suspended";
    allCustomers = allCustomers.filter(c => c.isSuspended === isSuspended);
  }

  // Apply sorting
  allCustomers.sort((a, b) => {
    if (sortBy === "newest") return b.rawDate - a.rawDate;
    if (sortBy === "oldest") return a.rawDate - b.rawDate;
    if (sortBy === "highest_spent") return b.totalSpent - a.totalSpent;
    if (sortBy === "most_orders") return b.totalOrders - a.totalOrders;
    return 0;
  });

  const totalCustomers = allCustomers.length;
  const totalPages = Math.ceil(totalCustomers / limit) || 1;
  const paginatedCustomers = allCustomers.slice((page - 1) * limit, page * limit);

  return (
    <CustomersClientView 
      initialCustomers={paginatedCustomers} 
      totalPages={totalPages} 
      currentPage={page} 
    />
  );
}
