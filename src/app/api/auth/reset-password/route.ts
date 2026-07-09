import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone, otp, password } = await request.json();

    if (!phone || !otp || !password) {
      return NextResponse.json({ error: 'Phone, OTP, and new password are required' }, { status: 400 });
    }

    // INDUSTRY STANDARD NOTE:
    // Here you would connect to your database, find the OTP record for this phone number,
    // verify that the OTP matches, and check that it hasn't expired.
    // e.g. const record = await db.otp.findFirst({ where: { phone, otp }})
    // if (!record || record.expiresAt < new Date()) throw Error...

    console.log(`[DB MOCK] Verifying OTP ${otp} for phone ${phone}...`);
    
    // For this demo, let's assume the OTP is valid if it's 6 digits
    if (otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Then hash the new password and update the user record
    // e.g. const hashedPassword = await bcrypt.hash(password, 10);
    // await db.user.update({ where: { phone }, data: { password: hashedPassword }});
    
    console.log(`[DB MOCK] Password updated successfully for phone ${phone}`);

    return NextResponse.json({ success: true, message: 'Password reset successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
