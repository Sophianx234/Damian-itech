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
    const priceStr = formData.get("price");
    const price = priceStr ? Number(priceStr) : undefined;
    const oldPrice = formData.get("oldPrice") ? Number(formData.get("oldPrice")) : undefined;
    const tag = formData.get("tag") || undefined;
    const tagType = formData.get("tagType") || undefined;
    const brand = formData.get("brand");
    const description = formData.get("description");
    const stock = Number(formData.get("stock"));
    const productType = formData.get("productType");
    const condition = formData.get("condition");
    const isSwappable = formData.get("isSwappable") === "true";
    const estValue = formData.get("estValue") ? Number(formData.get("estValue")) : undefined;
    const lookingFor = formData.get("lookingFor") || undefined;
    const category = formData.get("category");
    const vendorName = formData.get("vendorName") || undefined;
    
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
      oldPrice,
      tag,
      tagType,
      brand,
      description,
      stock,
      productType,
      condition: condition || undefined,
      isSwappable,
      estValue,
      lookingFor,
      category,
      vendorName,
      batteryHealth: batteryHealth ? Number(batteryHealth) : undefined,
      ram: ram || undefined,
      storage: storage || undefined,
      customSpecs,
      images,
      status: "Active"
    });

    // Revalidate the products master table cache and homepage
    revalidatePath("/admin/products");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: newProduct, message: "Product created successfully" });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
