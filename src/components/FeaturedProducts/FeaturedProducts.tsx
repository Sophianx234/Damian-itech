import React from 'react';
import styles from './FeaturedProducts.module.css';
import ProductCard from '../ProductCard/ProductCard';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

const FeaturedProducts = async () => {
  await dbConnect();

  const dbProducts = await Product.find({
    status: 'Active',
    isSwappable: false
  }).sort({ createdAt: -1 }).limit(5);

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Featured Products</h2>
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

export default FeaturedProducts;
