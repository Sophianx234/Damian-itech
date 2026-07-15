"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchMoreItems } from "./actions";
import styles from "./LoadMoreGrid.module.css";

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  price: string;
  image: string;
}

interface LoadMoreGridProps {
  initialItems: ProductItem[];
}

export default function LoadMoreGrid({ initialItems }: LoadMoreGridProps) {
  const [state, formAction, pending] = useActionState(fetchMoreItems, {
    items: initialItems,
    offset: 12,
    hasMore: initialItems.length === 12,
  });

  return (
    <div>
      <div className={styles.gridWrapper}>
        {state.items.map((item) => (
          <div key={item.id} className={styles.gridCell}>
            <div className={styles.imageWrapper}>
              <Image 
                src={item.image} 
                alt={item.title} 
                fill 
                style={{ objectFit: "cover" }} 
              />
            </div>
            <h3 className={styles.productTitle}>{item.title}</h3>
            <p className={styles.productPrice}>{item.price}</p>
            <Link href={`/products/${item.slug}`} className={styles.viewBtn}>
              View Details
            </Link>
          </div>
        ))}
      </div>
      
      {state.hasMore && (
        <form action={formAction} className={styles.loadMoreContainer}>
          <button type="submit" className={styles.loadMoreBtn} disabled={pending}>
            {pending ? "Loading..." : "Load More"}
          </button>
        </form>
      )}
    </div>
  );
}
