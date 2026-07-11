import React from 'react';
import styles from './SwapItems.module.css';
import ProductCard from '../ProductCard/ProductCard';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

const SwapItems = async () => {
  await dbConnect();

  const swapItems = await Product.find({
    status: 'Active',
    isSwappable: true
  }).sort({ createdAt: -1 }).limit(5);

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Available for Swap</h2>
        <div className={styles.grid}>
          {swapItems.map(item => (
            <ProductCard
              key={item._id.toString()}
              id={item._id.toString()}
              slug={item.slug}
              name={item.title}
              image={item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop"}
              estValue={item.estValue ? `₵${item.estValue}` : undefined}
              lookingFor={item.lookingFor || "Offers"}
              tag={item.tag}
              tagType={item.tagType}
              variant="swap"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SwapItems;
