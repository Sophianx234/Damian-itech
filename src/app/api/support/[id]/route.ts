import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SupportTicket } from '@/models/SupportTicket';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('Support PATCH error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const ticket = await SupportTicket.findByIdAndDelete(id);

    if (!ticket) {
      return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    console.error('Support DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
