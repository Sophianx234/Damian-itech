import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, price, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // In a real application, you would update the database here.
    // e.g., await db.product.update({ where: { id }, data: { price, status } });
    
    console.log(`Updated product ${id}: price=${price}, status=${status}`);

    // Revalidate the products page to instantly show fresh data
    revalidatePath("/admin/products");

    return NextResponse.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
