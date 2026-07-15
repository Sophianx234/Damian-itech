"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { productSchema } from "@/lib/validations";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") 
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function createProductAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  // 1. Session Verification at the Server Action boundary
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  
  if (!sessionToken) {
    return { message: "Unauthorized: No session found", success: false };
  }

  const session = await verifySession(sessionToken);
  if (!session || !session.role) {
    return { message: "Unauthorized: Invalid session", success: false };
  }

  // 2. Strict RBAC enforcement
  if (!hasPermission(session.role as string, 'create')) {
    return { message: "Forbidden: Insufficient privileges to create products", success: false };
  }

  // 3. Extract and cast form data for Zod validation
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

  // 4. Safe parse with Zod
  const validatedFields = productSchema.safeParse(rawData);

  // 5. If validation fails, return early with flattened errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors in the form.",
      success: false
    };
  }

  // 6. Execute Database Mutation
  try {
    await dbConnect();
    const { data } = validatedFields;
    const slug = slugify(data.title);
    
    await Product.create({
      ...data,
      slug,
      images: data.imageUrls,
      status: "Active"
    });

  } catch (error: any) {
    console.error("Mongoose mutation error:", error);
    // Specifically handle duplicate slug/title
    if (error.code === 11000) {
      return { errors: { title: ["A product with a similar title already exists."] }, success: false };
    }
    return { message: "Internal server error during product creation.", success: false };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}
