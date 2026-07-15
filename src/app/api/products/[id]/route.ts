import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifySession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";

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
  try {
    const { id } = await params;
    await dbConnect();
    const formData = await req.formData();
    
    const updateData: any = {};
    
    // Extract standard fields if they exist
    const fields = [
      "title", "slug", "brand", "description", "productType", 
      "condition", "category", "status", "tag", "tagType", "lookingFor", "vendorName"
    ];
    
    fields.forEach(field => {
      const val = formData.get(field);
      if (val !== null) updateData[field] = val;
    });

    // Extract numeric/boolean fields
    if (formData.get("price") !== null) updateData.price = Number(formData.get("price"));
    if (formData.get("oldPrice") !== null) updateData.oldPrice = formData.get("oldPrice") ? Number(formData.get("oldPrice")) : undefined;
    if (formData.get("stock") !== null) updateData.stock = Number(formData.get("stock"));
    if (formData.get("isSwappable") !== null) {
      updateData.isSwappable = formData.get("isSwappable") === "true";
      if (!updateData.isSwappable) {
        updateData.$unset = { estValue: 1, lookingFor: 1 };
      }
    }
    if (formData.get("estValue") !== null && formData.get("isSwappable") === "true") {
      updateData.estValue = formData.get("estValue") ? Number(formData.get("estValue")) : undefined;
    }
    
    if (formData.get("batteryHealth") !== null) updateData.batteryHealth = formData.get("batteryHealth") ? Number(formData.get("batteryHealth")) : undefined;
    if (formData.get("ram") !== null) updateData.ram = formData.get("ram") || undefined;
    if (formData.get("storage") !== null) updateData.storage = formData.get("storage") || undefined;

    // Custom Specs
    const customSpecsString = formData.get("customSpecs");
    if (customSpecsString && typeof customSpecsString === "string") {
      updateData.customSpecs = JSON.parse(customSpecsString);
    }

    // Images
    const imageUrlsString = formData.get("imageUrls");
    if (imageUrlsString && typeof imageUrlsString === "string") {
      updateData.images = JSON.parse(imageUrlsString);
    }

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
