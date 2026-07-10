import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const formData = await req.formData();
    
    const title = formData.get("title");
    const slug = formData.get("slug");
    const price = Number(formData.get("price"));
    const brand = formData.get("brand");
    const description = formData.get("description");
    const stock = Number(formData.get("stock"));
    const productType = formData.get("productType");
    const condition = formData.get("condition");
    const isSwappable = formData.get("isSwappable") === "true";
    const category = formData.get("category");
    
    const batteryHealth = formData.get("batteryHealth");
    const ram = formData.get("ram");
    const storage = formData.get("storage");

    const customSpecsString = formData.get("customSpecs");
    let customSpecs = [];
    if (customSpecsString && typeof customSpecsString === "string") {
      customSpecs = JSON.parse(customSpecsString);
    }

    const imageUrlsString = formData.get("imageUrls");
    let images = [];
    if (imageUrlsString && typeof imageUrlsString === "string") {
      images = JSON.parse(imageUrlsString);
    }

    const newProduct = await Product.create({
      title,
      slug,
      price,
      brand,
      description,
      stock,
      productType,
      condition: condition || undefined,
      isSwappable,
      category,
      batteryHealth: batteryHealth ? Number(batteryHealth) : undefined,
      ram: ram || undefined,
      storage: storage || undefined,
      customSpecs,
      images,
      status: "Active"
    });

    // Revalidate the products master table cache
    revalidatePath("/admin/products");

    return NextResponse.json({ success: true, data: newProduct, message: "Product created successfully" });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
