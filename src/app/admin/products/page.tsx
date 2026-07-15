import React from "react";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductsClientView from "./ProductsClientView";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await dbConnect();

  // Directly query DB, eliminating the need for an intermediate API route for the initial load
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  
  const formattedProducts = products.map((p: any) => ({
    id: p._id.toString(),
    slug: p.slug,
    title: p.title,
    brand: p.brand,
    category: p.category,
    vendorName: p.vendorName,
    productType: p.productType,
    condition: p.condition,
    isSwappable: p.isSwappable,
    batteryHealth: p.batteryHealth,
    ram: p.ram,
    storage: p.storage,
    customSpecs: p.customSpecs,
    price: `₵${Number(p.isSwappable ? (p.estValue || p.price || 0) : (p.price || 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    status: p.status,
    image: p.images && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop",
  }));

  return <ProductsClientView initialProducts={formattedProducts} />;
}
