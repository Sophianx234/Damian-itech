"use client";

import React, { useActionState } from 'react';
import styles from './FeaturedProducts.module.css';
import ProductCard from '../ProductCard/ProductCard';
import { fetchMoreFeaturedProducts } from './actions';

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

interface FeaturedProductsClientProps {
  initialItems: FeaturedProductItem[];
}

const FeaturedProductsClient = ({ initialItems }: FeaturedProductsClientProps) => {
  const [state, formAction, pending] = useActionState(fetchMoreFeaturedProducts, {
    items: initialItems,
    offset: 12,
    hasMore: initialItems.length === 12,
  });

  return (
    <>
      <div className={styles.grid}>
        {state.items.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            name={product.title}
            image={product.image}
            price={product.price}
            oldPrice={product.oldPrice}
            tag={product.tag}
            tagType={product.tagType}
            variant="shop"
          />
        ))}
      </div>
      {state.hasMore && (
        <form action={formAction} className={styles.loadMoreContainer}>
          <button type="submit" className={styles.loadMoreBtn} disabled={pending}>
            {pending ? "Loading..." : "Load More"}
          </button>
        </form>
      )}
    </>
  );
};

export default FeaturedProductsClient;
