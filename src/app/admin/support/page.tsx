import React from 'react';
import dbConnect from '@/lib/mongodb';
import { SupportTicket } from '@/models/SupportTicket';
import SupportDashboard from './SupportDashboard';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function AdminSupportPage(props: Props) {
  await dbConnect();
  
  const searchParams = await props.searchParams;

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : "";

  const limit = 15;
  const query: any = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  
  if (statusFilter && statusFilter !== "all") query.status = statusFilter;

  const totalTicketsCount = await SupportTicket.countDocuments(query);
  const totalPages = Math.ceil(totalTicketsCount / limit) || 1;

  // Fetch tickets
  const rawTickets = await SupportTicket.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  
  // Serialize for Client Component
  const tickets = rawTickets.map((ticket: any) => ({
    _id: ticket._id.toString(),
    name: ticket.name,
    email: ticket.email,
    phone: ticket.phone || '',
    message: ticket.message,
    status: ticket.status,
    createdAt: ticket.createdAt.toISOString(),
  }));

  return (
    <div>
      <SupportDashboard 
        initialTickets={tickets} 
        totalPages={totalPages} 
        currentPage={page} 
      />
    </div>
  );
}
