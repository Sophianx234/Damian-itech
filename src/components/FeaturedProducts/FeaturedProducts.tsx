import React from 'react';
import styles from './FeaturedProducts.module.css';
import ProductCard from '../ProductCard/ProductCard';
import { getShopProducts } from '../../data/products';

const FeaturedProducts = () => {
  // Grab the first 5 shop products for this section
  const products = getShopProducts().slice(0, 5);

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Featured Products</h2>
        <div className={styles.grid}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              name={product.name}
              image={product.images[0]}
              price={product.price}
              oldPrice={product.oldPrice}
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
