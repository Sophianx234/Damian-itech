import React from 'react';
import styles from './SwapItems.module.css';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import SwapItemsClient from './SwapItemsClient';

const SwapItems = async () => {
  await dbConnect();

  const swapItems = await Product.find({
    status: 'Active',
    isSwappable: true
  }).sort({ createdAt: -1 }).limit(12).lean();

  const initialItems = swapItems.map((item: any) => ({
    id: item._id.toString(),
    title: item.title,
    slug: item.slug,
    estValue: item.estValue ? `₵${item.estValue}` : undefined,
    lookingFor: item.lookingFor || "Offers",
    tag: item.tag,
    tagType: item.tagType,
    image: item.images && item.images.length > 0 
      ? item.images[0] 
      : "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop",
  }));

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Available for Swap</h2>
        <SwapItemsClient initialItems={initialItems} />
      </div>
    </section>
  );
};

export default SwapItems;
