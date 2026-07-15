"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  price: string;
  image: string;
}

interface LoadMoreState {
  items: ProductItem[];
  offset: number;
  hasMore: boolean;
}

export async function fetchMoreItems(prevState: LoadMoreState, formData: FormData): Promise<LoadMoreState> {
  await dbConnect();
  
  const offset = prevState.offset;
  const limit = 12;

  const rawProducts = await Product.find({ status: "Active" })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  const newItems = rawProducts.map((p: any) => ({
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    price: `₵${Number(p.isSwappable ? (p.estValue || p.price || 0) : (p.price || 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    image: p.images && p.images.length > 0 
      ? p.images[0] 
      : "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop",
  }));

  const hasMore = newItems.length === limit;

  return {
    items: [...prevState.items, ...newItems],
    offset: offset + limit,
    hasMore,
  };
}
