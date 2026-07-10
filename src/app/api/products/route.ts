import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const title = formData.get("title");
    const slug = formData.get("slug");
    const price = formData.get("price");
    const brand = formData.get("brand");
    const productType = formData.get("productType"); // 'Store' | 'Used'
    const condition = formData.get("condition"); // only if 'Used'
    const isSwappable = formData.get("isSwappable") === "true";
    const category = formData.get("category");
    
    // Dynamic specifications
    const batteryHealth = formData.get("batteryHealth");
    const ram = formData.get("ram");
    const storage = formData.get("storage");

    // Extract images (Max 5 enforced on frontend, but we collect them here)
    const images: File[] = [];
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image_${i}`);
      if (file && file instanceof File) {
        images.push(file);
      }
    }

    // In a real application, you would:
    // 1. Upload the 'images' files to a storage bucket (S3, Cloudinary, etc.)
    // 2. Get the returned URLs.
    // 3. Save the product data + image URLs to the database.
    // Example: await db.product.create({ data: { title, slug, price, productType, isSwappable, images: imageUrls, ... } })
    
    console.log("Mock Database Insertion:", {
      title,
      slug,
      price,
      brand,
      productType,
      condition,
      isSwappable,
      category,
      batteryHealth,
      ram,
      storage,
      imagesCount: images.length,
    });

    // Revalidate the products master table cache
    revalidatePath("/admin/products");

    return NextResponse.json({ success: true, message: "Product created successfully" });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
