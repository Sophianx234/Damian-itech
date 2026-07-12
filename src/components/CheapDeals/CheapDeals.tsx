import React from 'react';
import styles from './CheapDeals.module.css';
import ProductCard from '../ProductCard/ProductCard';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

const CheapDeals = async () => {
  await dbConnect();

  const dbProducts = await Product.find({
    status: 'Active',
    isSwappable: false,
    price: { $lte: 1000 } // Only target cheap products under 1000
  }).sort({ price: 1 }).limit(5);

  if (dbProducts.length === 0) {
    return null; // Don't show the section if no products
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Cheap Deals</h2>
        <div className={styles.grid}>
          {dbProducts.map(product => (
            <ProductCard
              key={product._id.toString()}
              id={product._id.toString()}
              slug={product.slug}
              name={product.title}
              image={product.images && product.images.length > 0 ? product.images[0] : "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop"}
              price={`₵${product.price}`}
              oldPrice={product.oldPrice ? `₵${product.oldPrice}` : undefined}
              tag={product.tag}
              tagType={product.tagType}
              variant="shop"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CheapDeals;
