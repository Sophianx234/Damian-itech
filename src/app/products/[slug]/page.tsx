"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import ProductCard from '../../../components/ProductCard/ProductCard';
import styles from './ProductDetails.module.css';

const mockProduct = {
  title: "Visionary VR Headset Pro",
  price: "$499.00",
  rating: 4.8,
  reviewsCount: 124,
  description: "Experience the next level of immersive digital environments with the Visionary VR Headset Pro. Engineered with ultra-low latency tracking, custom OLED displays, and a breathtaking 120Hz refresh rate, it bridges the gap between reality and the virtual world. Designed for both professional creators and dedicated gamers, its ergonomic balance ensures hours of fatigue-free use.",
  specs: [
    { label: "Display", value: "Dual Custom OLED (2000x2040 per eye)" },
    { label: "Refresh Rate", value: "90Hz, 120Hz" },
    { label: "Field of View", value: "110 degrees" },
    { label: "Tracking", value: "Inside-out 6DoF tracking" },
    { label: "Audio", value: "Integrated 3D spatial audio" },
    { label: "Weight", value: "520g" }
  ],
  images: [
    "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop", // VR Headset
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop", // Headphones
    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop", // Smartwatch
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop"  // Laptop
  ]
};

const relatedProducts = [
  { id: 1, name: "Next-Gen Console", price: "$499", image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop", tag: "Sale", tagType: "sale" },
  { id: 2, name: "Premium Soundbar", price: "$299", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop" },
  { id: 3, name: "Pro Smartphone 15", price: "$999", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop", tag: "New", tagType: "new" },
  { id: 4, name: "Creator Tablet Pro", price: "$799", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop", tag: "Sale", tagType: "sale" }
];

export default function ProductDetails() {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const nextImage = () => {
    setActiveImage((prev) => (prev === mockProduct.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev === 0 ? mockProduct.images.length - 1 : prev - 1));
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={`container ${styles.container}`}>
          
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs}>
            Home / Electronics / VR & AR / <span className={styles.currentCrumb}>{mockProduct.title}</span>
          </nav>

          {/* Hero Section */}
          <div className={styles.heroGrid}>
            
            {/* Left: Gallery */}
            <div className={styles.galleryColumn}>
              <div className={styles.mainImageWrapper}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={mockProduct.images[activeImage]}
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
                
                {mockProduct.images.map((img, idx) => (
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
              <h1 className={styles.title}>{mockProduct.title}</h1>
              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  ★★★★★
                </div>
                <span className={styles.reviewsCount}>({mockProduct.reviewsCount} reviews)</span>
              </div>
              <div className={styles.price}>{mockProduct.price}</div>
              
              <div className={styles.divider} />

              {/* Call to Action */}
              <div className={styles.ctaRow}>
                <div className={styles.quantitySelector}>
                  <button onClick={decrementQty} className={styles.qtyBtn}>-</button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button onClick={incrementQty} className={styles.qtyBtn}>+</button>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={styles.addToCartBtn}
                >
                  Add to Cart
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
                    <p className={styles.descriptionText}>{mockProduct.description}</p>
                  )}
                  {activeTab === 'specs' && (
                    <div className={styles.specsList}>
                      {mockProduct.specs.map((spec, i) => (
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
                  name={prod.name}
                  image={prod.image}
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
