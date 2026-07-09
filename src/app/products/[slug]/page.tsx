"use client";

import React, { useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import ProductCard from '../../../components/ProductCard/ProductCard';
import styles from './ProductDetails.module.css';
import { getProductBySlug, getShopProducts, Product } from '../../../data/products';
import { useCart } from '../../../context/CartContext';

export default function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const relatedProducts = getShopProducts().filter(p => p.slug !== slug).slice(0, 4);

  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={`container ${styles.container}`} style={{ textAlign: 'center', paddingTop: '100px' }}>
            <h1>Product Not Found</h1>
            <p>The product you are looking for does not exist.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const incrementQty = () => setQuantity(prev => {
    if (product.stock !== undefined && prev >= product.stock) {
      return product.stock;
    }
    return prev + 1;
  });
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const nextImage = () => {
    setActiveImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price || "$0.00",
      image: product.images[0],
      quantity: quantity,
      stock: product.stock,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={`container ${styles.container}`}>
          
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs}>
            Home / Electronics / VR & AR / <span className={styles.currentCrumb}>{product.name}</span>
          </nav>

          {/* Hero Section */}
          <div className={styles.heroGrid}>
            
            {/* Left: Gallery */}
            <div className={styles.galleryColumn}>
              <div className={styles.mainImageWrapper}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={product.images[activeImage]}
                    alt={`Product view ${activeImage + 1}`}
                    className={styles.mainImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>

              <div className={styles.thumbnailsWrapper}>
                <button className={styles.thumbNavBtn} onClick={prevImage} aria-label="Previous image">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    className={`${styles.thumbnailBtn} ${activeImage === idx ? styles.activeThumb : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className={styles.thumbnailImg} />
                    {activeImage === idx && (
                      <motion.div 
                        layoutId="activeThumb"
                        className={styles.activeThumbIndicator}
                      />
                    )}
                  </button>
                ))}

                <button className={styles.thumbNavBtn} onClick={nextImage} aria-label="Next image">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>

            {/* Right: Info */}
            <div className={styles.infoColumn}>
              <h1 className={styles.title}>{product.name}</h1>
              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  ★★★★★
                </div>
                <span className={styles.reviewsCount}>({product.reviewsCount} reviews)</span>
              </div>
              <div className={styles.price}>{product.price}</div>
              
              
              <div className={styles.divider} />

              {/* Call to Action */}
              <div className={styles.ctaRow}>
                <div className={styles.quantitySelector}>
                  <button onClick={decrementQty} className={styles.qtyBtn} disabled={quantity <= 1}>-</button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button onClick={incrementQty} className={styles.qtyBtn} disabled={product.stock !== undefined && quantity >= product.stock}>+</button>
                </div>
                {product.stock !== undefined && (
                <div style={{ marginTop: '12px', display:'flex',alignItems: 'center', flexDirection: 'column', fontSize: '0.8rem', color: product.stock > 0 ? 'var(--brand-primary)' : 'red', fontWeight: 500 }}>
                  {product.stock > 0 ? `${product.stock}` : 'Out of stock'}
                  <span>
                    {product.stock > 0 && `in stock` }
                  </span>
                </div>
              )}
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={styles.addToCartBtn}
                  onClick={handleAddToCart}
                  disabled={isAdded || (product.stock !== undefined && product.stock === 0)}
                  style={{ backgroundColor: isAdded ? 'var(--brand-primary)' : '' }}
                >
                  {isAdded ? "Added ✓" : (product.stock === 0 ? "Out of Stock" : "Add to Cart")}
                </motion.button>
              </div>

              {/* Secondary Actions */}
              <div className={styles.secondaryActions}>
                <button className={styles.actionBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  <span>Add to Wishlist</span>
                </button>
                <button className={styles.actionBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 21l6-6M9 8l-3 3-3-3M3 11V6h5"></path></svg>
                  <span>Compare</span>
                </button>
              </div>

            </div>
          </div>

          {/* Details Tabs */}
          <div className={styles.tabsSection}>
            <div className={styles.tabHeader}>
              {(['description', 'specs', 'reviews'] as const).map(tab => (
                <button 
                  key={tab}
                  className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="tabUnderline"
                      className={styles.tabUnderline}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className={styles.tabContent}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'description' && (
                    <p className={styles.descriptionText}>{product.description}</p>
                  )}
                  {activeTab === 'specs' && (
                    <div className={styles.specsList}>
                      {product.specs.map((spec, i) => (
                        <div key={i} className={styles.specRow}>
                          <span className={styles.specLabel}>{spec.label}</span>
                          <span className={styles.specValue}>{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'reviews' && (
                    <p className={styles.reviewsText}>Customer reviews will be displayed here.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Related Products */}
          <div className={styles.relatedSection}>
            <h3 className={styles.relatedTitle}>You May Also Like</h3>
            <div className={styles.relatedGrid}>
              {relatedProducts.map(prod => (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  slug={prod.slug}
                  name={prod.name}
                  image={prod.images[0]}
                  price={prod.price}
                  tag={prod.tag}
                  tagType={prod.tagType}
                  variant="shop"
                />
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
