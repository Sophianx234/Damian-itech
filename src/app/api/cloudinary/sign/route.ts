import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'damian-itech/products';
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!apiSecret) {
      return NextResponse.json({ error: "Missing CLOUDINARY_API_SECRET" }, { status: 500 });
    }

    // Hardcoded security parameters to prevent malicious file uploads
    const allowedFormats = "jpg,png,jpeg,webp";

    // Parameters MUST be alphabetically sorted for Cloudinary signature
    // a -> allowed_formats, f -> folder, t -> timestamp
    const signatureStr = `allowed_formats=${allowedFormats}&folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    
    const signature = crypto.createHash('sha1')
      .update(signatureStr)
      .digest('hex');

    return NextResponse.json({ 
      timestamp, 
      signature, 
      folder,
      allowed_formats: allowedFormats,
      apiKey: process.env.CLOUDINARY_API_KEY, 
      cloudName: process.env.CLOUDINARY_CLOUD_NAME 
    });
  } catch (error) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
