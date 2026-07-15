"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Truck, ShieldCheck, Lock } from 'lucide-react';
import ProductCard from '../../../components/ProductCard/ProductCard';
import SwapProposalModal from '../../../components/SwapProposalModal/SwapProposalModal';
import styles from './ProductDetails.module.css';
import { useCart } from '../../../context/CartContext';

export default function ProductDetailsClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setIsAuthenticated(true);
          fetch('/api/wishlist')
            .then(res => res.json())
            .then(wishlistData => {
              if (wishlistData.success && wishlistData.data.some((item: any) => (item._id || item).toString() === product._id.toString())) {
                setIsWishlisted(true);
              }
            });
        }
      });
  }, [product._id]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      alert("Please log in to add items to your wishlist.");
      router.push('/login');
      return;
    }
    
    const previousState = isWishlisted;
    setIsWishlisted(!isWishlisted);

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      
      if (!data.success) {
        setIsWishlisted(previousState);
        alert(data.error || "Failed to update wishlist");
      } else {
        setIsWishlisted(data.isWishlisted);
      }
    } catch (err) {
      setIsWishlisted(previousState);
      alert("An error occurred");
    }
  };

  const incrementQty = () => setQuantity(prev => {
    if (product.stock !== undefined && prev >= product.stock) {
      return product.stock;
    }
    return prev + 1;
  });
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const nextImage = () => {
    setActiveImage((prev) => (prev === (product.images?.length || 1) - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev === 0 ? (product.images?.length || 1) - 1 : prev - 1));
  };

  // Compile specs
  const specs: { label: string; value: string }[] = [];
  if (product.brand) specs.push({ label: "Brand", value: product.brand });
  if (product.batteryHealth) specs.push({ label: "Battery Health", value: `${product.batteryHealth}%` });
  if (product.ram) specs.push({ label: "RAM", value: product.ram });
  if (product.storage) specs.push({ label: "Storage", value: product.storage });
  if (product.condition) specs.push({ label: "Condition", value: product.condition });
  if (product.customSpecs) {
    product.customSpecs.forEach((spec: any) => {
      specs.push({ label: spec.key, value: spec.value });
    });
  }

  const handleAddToCart = () => {
    const essentialSpecs = specs.filter(s => ['Color', 'Storage', 'RAM', 'Battery Health', 'Condition'].includes(s.label));
    
    addToCart({
      id: product._id,
      slug: product.slug,
      name: product.title,
      price: `₵${Number(product.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      oldPrice: product.oldPrice ? `₵${Number(product.oldPrice).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : undefined,
      image: product.images?.[0] || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
      quantity: quantity,
      stock: product.stock,
      attributes: essentialSpecs,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const formattedPrice = `₵${Number(product.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  const hasImages = product.images && product.images.length > 0;
  const currentImage = hasImages ? product.images[activeImage] : 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop';

  return (
    <div className={`container ${styles.container}`}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        Home / {product.category} / {product.productType} / <span className={styles.currentCrumb}>{product.title}</span>
      </nav>

      {/* Hero Section */}
      <div className={styles.heroGrid}>
        {/* Left: Gallery */}
        <div className={styles.galleryColumn}>
          <div className={styles.mainImageWrapper}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={currentImage}
                alt={`Product view ${activeImage + 1}`}
                className={styles.mainImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
          </div>

          {hasImages && product.images.length > 1 && (
            <div className={styles.thumbnailsWrapper}>
              <button className={styles.thumbNavBtn} onClick={prevImage} aria-label="Previous image">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              
              {product.images.map((img: string, idx: number) => (
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
          )}
        </div>

        {/* Right: Info */}
        <div className={styles.infoColumn}>
          
          {/* Meta Badges */}
          <div className={styles.metaBadges}>
            <span className={styles.metaBadge}>{product.category}</span>
            <span className={styles.metaBadge}>{product.productType}</span>
            {product.condition && <span className={styles.metaBadge}>{product.condition}</span>}
            {product.isSwappable && <span className={styles.metaBadge} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.2)' }}>Swappable</span>}
          </div>

          <h1 className={styles.title}>{product.title}</h1>
          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              ★★★★★
            </div>
            <span className={styles.reviewsCount}>(0 reviews)</span>
          </div>
          <div className={styles.price}>
            {formattedPrice}
            {product.oldPrice && <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.2rem', marginLeft: '12px' }}>₵{Number(product.oldPrice).toLocaleString()}</span>}
          </div>
          
          {product.isSwappable && (
            <div className={styles.swapInfo} style={{ margin: '8px 0 32px 0', border: 'none', padding: '0', backgroundColor: 'transparent' }}>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                Swap Target: <span style={{ fontSize: '1.2rem', fontWeight: '500', marginLeft: '8px', color: 'var(--text-primary)' }}>{product.lookingFor || 'Open to offers'}</span>
              </div>
            </div>
          )}
          
          <div className={styles.divider} />

          {/* Call to Action */}
          <div className={styles.ctaRow} style={{ flexWrap: 'wrap', gap: '16px' }}>
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
            
            <div className={styles.actionButtonsContainer}>
              <motion.button 
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={isAdded || (product.stock !== undefined && product.stock === 0) || product.status !== 'Active'}
                style={{ flex: 1, backgroundColor: isAdded ? 'var(--brand-primary)' : '', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {!isAdded && product.status === 'Active' && product.stock !== 0 && <ShoppingBag size={20} />}
                {product.status !== 'Active' ? 'Not Available' : isAdded ? "Added ✓" : (product.stock === 0 ? "Out of Stock" : "Add to Cart")}
              </motion.button>
              
              {product.isSwappable && (
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={styles.swapBtn}
                  onClick={() => setIsSwapModalOpen(true)}
                  disabled={product.status !== 'Active'}
                  style={{ flex: 1 }}
                >
                  {product.status !== 'Active' ? 'Unavailable' : 'Propose Swap'}
                </motion.button>
              )}
            </div>
          </div>

          {/* Secondary Actions */}
          <div className={styles.secondaryActions}>
            <button 
              className={styles.actionBtn}
              onClick={handleWishlistToggle}
              style={{ color: isWishlisted ? '#ef4444' : 'inherit' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span>{isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <Truck strokeWidth={1.5} className={styles.trustIcon} />
              <span>Free & Fast<br/>Delivery</span>
            </div>
            <div className={styles.trustBadge}>
              <ShieldCheck strokeWidth={1.5} className={styles.trustIcon} />
              <span>1 Year<br/>Warranty</span>
            </div>
            <div className={styles.trustBadge}>
              <Lock strokeWidth={1.5} className={styles.trustIcon} />
              <span>Secure<br/>Checkout</span>
            </div>
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
                <p className={styles.descriptionText} style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
              )}
              {activeTab === 'specs' && (
                <div className={styles.specsList}>
                  {specs.length > 0 ? specs.map((spec, i) => (
                    <div key={i} className={styles.specRow}>
                      <span className={styles.specLabel}>{spec.label}</span>
                      <span className={styles.specValue}>{spec.value}</span>
                    </div>
                  )) : (
                    <p>No specifications provided.</p>
                  )}
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
      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <h3 className={styles.relatedTitle}>You May Also Like</h3>
          <div className={styles.relatedGrid}>
            {relatedProducts.map(prod => (
              <ProductCard
                key={prod._id}
                id={prod._id}
                slug={prod.slug}
                name={prod.title}
                image={prod.images?.[0] || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'}
                price={`₵${Number(prod.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                tag={prod.tag}
                tagType={prod.tagType}
                variant="shop"
              />
            ))}
          </div>
        </div>
      )}

      <SwapProposalModal 
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        storeProductTitle={product.title}
        storeProductPrice={Number(product.estValue || product.price || 0).toLocaleString()}
      />
    </div>
  );
}
