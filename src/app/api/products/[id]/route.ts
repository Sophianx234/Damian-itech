import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifySession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { productSchema } from "@/lib/validations";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  if (!sessionToken) return new Response('Unauthorized', { status: 401 });

  const session = await verifySession(sessionToken);
  if (!session || !session.role) return new Response('Unauthorized', { status: 401 });

  if (!hasPermission(session.role as string, 'edit')) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const { id } = await params;
    await dbConnect();
    const formData = await req.formData();
    
    // Convert FormData to object for Zod validation
    const rawData = {
      title: formData.get("title") as string,
      price: formData.get("price") ? Number(formData.get("price")) : undefined,
      oldPrice: formData.get("oldPrice") ? Number(formData.get("oldPrice")) : undefined,
      tag: formData.get("tag") as string || undefined,
      tagType: formData.get("tagType") as string || undefined,
      brand: formData.get("brand") as string,
      description: formData.get("description") as string,
      stock: Number(formData.get("stock") || 0),
      productType: formData.get("productType") as string,
      condition: formData.get("condition") as string || undefined,
      isSwappable: formData.get("isSwappable") === "true",
      estValue: formData.get("estValue") ? Number(formData.get("estValue")) : undefined,
      lookingFor: formData.get("lookingFor") as string || undefined,
      category: formData.get("category") as string,
      vendorName: formData.get("vendorName") as string || undefined,
      batteryHealth: formData.get("batteryHealth") ? Number(formData.get("batteryHealth")) : undefined,
      ram: formData.get("ram") as string || undefined,
      storage: formData.get("storage") as string || undefined,
      customSpecs: JSON.parse((formData.get("customSpecs") as string) || "[]"),
      imageUrls: JSON.parse((formData.get("imageUrls") as string) || "[]"),
    };

    // Safe parse with Zod
    // Note: for PUT (partial updates), we might want to use .partial() if not all fields are sent,
    // but the edit form usually sends all fields anyway. Let's assume full update.
    const validatedFields = productSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validatedFields.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { data } = validatedFields;
    // For Mongoose, we map imageUrls to images
    const updateData = {
      ...data,
      images: data.imageUrls
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    
    return NextResponse.json({ success: true, data: updatedProduct, message: "Product updated successfully" });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Defense-in-Depth: Always retrieve session explicitly in the handler
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  if (!sessionToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify the JWT signature and payload
  const session = await verifySession(sessionToken);
  if (!session || !session.role) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Dynamic RBAC enforcement
  if (!hasPermission(session.role as string, 'delete')) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const { id } = await params;
    await dbConnect();
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    
    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
