"use client";

import React, { useActionState } from 'react';
import styles from './SwapItems.module.css';
import ProductCard from '../ProductCard/ProductCard';
import { fetchMoreSwapItems } from './actions';

interface SwapItemData {
  id: string;
  slug: string;
  title: string;
  image: string;
  estValue?: string;
  lookingFor: string;
  tag?: string;
  tagType?: string;
}

interface SwapItemsClientProps {
  initialItems: SwapItemData[];
}

const SwapItemsClient = ({ initialItems }: SwapItemsClientProps) => {
  const [state, formAction, pending] = useActionState(fetchMoreSwapItems, {
    items: initialItems,
    offset: 12,
    hasMore: initialItems.length === 12,
  });

  return (
    <>
      <div className={styles.grid}>
        {state.items.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            slug={item.slug}
            name={item.title}
            image={item.image}
            estValue={item.estValue}
            lookingFor={item.lookingFor}
            tag={item.tag}
            tagType={item.tagType}
            variant="swap"
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

export default SwapItemsClient;
