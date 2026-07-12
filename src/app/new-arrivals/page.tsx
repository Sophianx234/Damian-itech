"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard/ProductCard';
import styles from './NewArrivals.module.css';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          // Enforce New Arrivals: Only keep the 20 most recently added items
          const newest = data.data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 20);
          setProducts(newest);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Dynamically generate categories from DB products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }

    result = [...result];
    if (sortBy === "priceAsc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "newest" || sortBy === "featured") {
      // Sort by newest arrivals
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <div className={styles.pageContainer}>
      {/* Filter and Grid Section */}
      <section className={styles.mainSection}>
        <div className="container">
        

          {/* Controls Container */}
          <div className={styles.controlsContainer}>
            
            {/* Search & Sort Row */}
            <div className={styles.searchSortRow}>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={18} />
                <input 
                  type="text" 
                  placeholder="Search new arrivals..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.sortWrapper}>
                <span className={styles.sortLabel}>Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="newest">Newest First</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`${styles.filterButton} ${activeCategory === category ? styles.activeFilter : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className={styles.productsGrid}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonInfo}>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonTitleShort}></div>
                    <div className={styles.skeletonPrice}></div>
                    <div className={styles.skeletonButton}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  slug={product.slug || product.title?.toLowerCase().replace(/\s+/g, '-')}
                  name={product.title}
                  image={product.images && product.images.length > 0 ? product.images[0] : "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600&auto=format&fit=crop"}
                  price={`$${product.price?.toFixed(2)}`}
                  oldPrice={product.oldPrice ? `$${product.oldPrice.toFixed(2)}` : null}
                  tag={product.tag}
                  tagType={product.tagType}
                  variant="shop"
                  stock={product.stock}
                />
              ))}
            </div>
          )}
          
          {!loading && filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              <p>No products found matching your criteria.</p>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
