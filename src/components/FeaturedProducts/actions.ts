"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

interface FeaturedProductItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  price: string;
  oldPrice?: string;
  tag?: string;
  tagType?: string;
}

interface LoadMoreState {
  items: FeaturedProductItem[];
  offset: number;
  hasMore: boolean;
}

export async function fetchMoreFeaturedProducts(prevState: LoadMoreState, formData: FormData): Promise<LoadMoreState> {
  await dbConnect();
  
  const offset = prevState.offset;
  const limit = 12;

  const rawProducts = await Product.find({
    status: 'Active',
    isSwappable: false
  })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  const newItems = rawProducts.map((p: any) => ({
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    price: `₵${p.price}`,
    oldPrice: p.oldPrice ? `₵${p.oldPrice}` : undefined,
    tag: p.tag,
    tagType: p.tagType,
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
