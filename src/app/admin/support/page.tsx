import React from 'react';
import dbConnect from '@/lib/mongodb';
import { SupportTicket } from '@/models/SupportTicket';
import SupportDashboard from './SupportDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  await dbConnect();
  
  // Fetch tickets, newest first
  const rawTickets = await SupportTicket.find({}).sort({ createdAt: -1 }).lean();
  
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
      <SupportDashboard initialTickets={tickets} />
    </div>
  );
}
