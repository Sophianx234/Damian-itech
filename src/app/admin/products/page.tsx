import React from "react";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductsClientView from "./ProductsClientView";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function AdminProductsPage(props: Props) {
  await dbConnect();
  
  const searchParams = await props.searchParams;

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : "";
  const type = typeof searchParams.type === "string" ? searchParams.type : "";
  const condition = typeof searchParams.condition === "string" ? searchParams.condition : "";
  const swap = typeof searchParams.swap === "string" ? searchParams.swap : "";
  const status = typeof searchParams.status === "string" ? searchParams.status : "";
  const vendor = typeof searchParams.vendor === "string" ? searchParams.vendor : "";

  const limit = 15;
  const query: any = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }
  if (category) query.category = category;
  if (type) query.productType = type;
  if (condition) query.condition = condition;
  if (swap) query.isSwappable = swap === "Yes";
  if (status) query.status = status;
  if (vendor) query.vendorName = vendor;

  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limit) || 1;

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
    
  // Fetch distinct vendors
  const distinctVendors = await Product.distinct("vendorName", { vendorName: { $nin: [null, ""] } });
  const vendors = distinctVendors.sort();

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

  return (
    <ProductsClientView 
      initialProducts={formattedProducts} 
      totalPages={totalPages} 
      currentPage={page} 
      vendors={vendors}
    />
  );
}
