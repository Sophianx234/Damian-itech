import React from 'react';
import styles from './FeaturedProducts.module.css';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import FeaturedProductsClient from './FeaturedProductsClient';

const FeaturedProducts = async () => {
  await dbConnect();

  const dbProducts = await Product.find({
    status: 'Active',
    isSwappable: false
  }).sort({ createdAt: -1 }).limit(12).lean();

  const initialItems = dbProducts.map((p: any) => ({
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

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Featured Products</h2>
        <FeaturedProductsClient initialItems={initialItems} />
      </div>
    </section>
  );
};

export default FeaturedProducts;
