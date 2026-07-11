"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Loader2 } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './Wishlist.module.css';

export default function WishlistClient() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/wishlist')
      .then(res => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          setProducts(data.data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch wishlist", err);
        setIsLoading(false);
      });
  }, [router]);

  const handleRemove = async (productId: string) => {
    // Optimistic UI update
    setProducts(prev => prev.filter(p => p._id !== productId));
    
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 className={styles.spin} size={48} color="var(--brand-primary)" />
      </div>
    );
  }

  return (
    <div className={`container ${styles.container}`}>
      <h1 className={styles.title}>My Wishlist</h1>
      <p className={styles.subtitle}>Keep track of all the gear you're eyeing.</p>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
          <p className={styles.emptyText}>You haven't saved any products yet. Start exploring our collection!</p>
          <Link href="/" className={styles.shopBtn}>
            Explore Products
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map(product => {
            const isSwappable = product.isSwappable;
            const priceVal = isSwappable 
              ? (product.estValue || product.price || 0) 
              : (product.price || 0);

            return (
              <div key={product._id} className={styles.productWrapper}>
                <button 
                  className={styles.removeBtn} 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(product._id);
                  }}
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>
                <ProductCard
                  id={product._id}
                  slug={product.slug}
                  name={product.title}
                  image={product.images?.[0] || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'}
                  tag={product.tag}
                  tagType={product.tagType}
                  variant={isSwappable ? 'swap' : 'shop'}
                  price={!isSwappable ? `₵${Number(priceVal).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : undefined}
                  oldPrice={!isSwappable && product.oldPrice ? `₵${Number(product.oldPrice).toLocaleString()}` : undefined}
                  estValue={isSwappable ? `₵${Number(priceVal).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : undefined}
                  lookingFor={isSwappable ? product.lookingFor : undefined}
                  stock={product.stock}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
