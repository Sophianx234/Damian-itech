"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: FormData, slug: string) {
  // Extract all the fields
  const title = formData.get("title");
  const price = formData.get("price");
  const brand = formData.get("brand");
  const condition = formData.get("condition");
  const category = formData.get("category");
  const batteryHealth = formData.get("batteryHealth"); // Dynamic field

  // Here you would typically insert this into your database.
  // e.g., await db.product.create({ data: { title, slug, price, ... } })

  console.log("Mock Database Insertion:", {
    title,
    slug,
    price,
    brand,
    condition,
    category,
    batteryHealth,
  });

  // Revalidate the products master table cache
  revalidatePath("/admin/products");

  // Seamlessly redirect back to the master table
  redirect("/admin/products");
}
