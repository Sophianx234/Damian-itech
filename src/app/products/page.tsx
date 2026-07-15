import React, { Suspense } from "react";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import LoadMoreGrid from "./LoadMoreGrid";

export const dynamic = "force-dynamic";

function CatalogSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 0, borderTop: '1px solid var(--border-primary)', borderLeft: '1px solid var(--border-primary)' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ borderRight: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)', padding: '16px', height: '400px', backgroundColor: 'var(--bg-secondary)', animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );
}

async function CatalogContent() {
  await dbConnect();
  
  // Fetch initial 12 items
  const rawProducts = await Product.find({ status: "Active" })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  const initialItems = rawProducts.map((p: any) => ({
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    price: `₵${Number(p.isSwappable ? (p.estValue || p.price || 0) : (p.price || 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    image: p.images && p.images.length > 0 
      ? p.images[0] 
      : "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop",
  }));

  return <LoadMoreGrid initialItems={initialItems} />;
}

export default function CatalogPage() {
  return (
    <main className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '32px' }}>Complete Catalog</h1>
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogContent />
      </Suspense>
    </main>
  );
}
