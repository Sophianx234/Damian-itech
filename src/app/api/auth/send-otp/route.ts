import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // INDUSTRY STANDARD NOTE: 
    // In a production environment, you would hash this OTP and store it in your database 
    // (e.g., Redis or PostgreSQL) associated with the phone number and an expiration timestamp (e.g., 10 mins).
    console.log(`[DB MOCK] Storing OTP ${otp} for phone ${phone}`);

    // 2. Fetch Arkesel API Key
    const arkeselApiKey = process.env.ARKESEL_API_KEY;
    
    if (!arkeselApiKey) {
      console.error('ARKESEL_API_KEY is missing from environment variables');
      return NextResponse.json({ error: 'Server SMS configuration error' }, { status: 500 });
    }

    // 3. Send SMS using Arkesel v2 API
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': arkeselApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: 'TechNest', // Must be an approved Sender ID on Arkesel (max 11 chars)
        message: `Your TechNest password reset code is ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
        recipients: [phone]
      })
    });

    const data = await response.json();

    // 4. Handle Arkesel Response
    if (!response.ok || data.status === 'error') {
      console.error('Arkesel API Error:', data);
      return NextResponse.json({ error: 'Failed to send SMS to this number' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
