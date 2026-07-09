import React from 'react';
import styles from './SwapItems.module.css';
import ProductCard from '../ProductCard/ProductCard';
import { getSwapProducts } from '../../data/products';

const SwapItems = () => {
  // Grab the first 5 swap items for this section
  const swapItems = getSwapProducts().slice(0, 5);

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Available for Swap</h2>
        <div className={styles.grid}>
          {swapItems.map(item => (
            <ProductCard
              key={item.id}
              id={item.id}
              slug={item.slug}
              name={item.name}
              image={item.images[0]}
              estValue={item.estValue}
              lookingFor={item.lookingFor}
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
