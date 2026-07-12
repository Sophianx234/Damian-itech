import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SupportTicket } from '@/models/SupportTicket';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const ticket = await SupportTicket.create(body);
    
    return NextResponse.json(
      { success: true, data: ticket, message: 'Message sent successfully.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Support POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Basic check for admin API, could integrate real auth check if using next-auth/sessions
    await dbConnect();
    
    // Sort by newest first
    const tickets = await SupportTicket.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: tickets });
  } catch (error: any) {
    console.error('Support GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
