"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, ShieldCheck } from 'lucide-react';


import { useCart } from '../../context/CartContext';
import styles from './Cart.module.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration safety: render empty state if not mounted yet
  if (!mounted) {
    return (
      <>
        <main className={styles.main}>
          <div className="container">
            <h1 className={styles.title}>Your Cart</h1>
          </div>
        </main>
        </>
    );
  }

  const deliveryFee = cartTotal > 10000 ? 0 : (cart.length > 0 ? 50 : 0); // 50 GHS delivery fee, free over 10000
  
  const finalTotal = cartTotal + deliveryFee;

  const formatCurrency = (value: number) => {
    return `₵${Number(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <>
      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>Your Cart</h1>

          {cart.length === 0 ? (
            <motion.div 
              className={styles.emptyState}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ShoppingBag size={64} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>Your cart is completely empty</h2>
              <p className={styles.emptyDesc}>
                Looks like you haven't added anything to your cart yet. Discover our premium collection of gear and accessories.
              </p>
              <Link href="/" className={styles.continueBtn}>
                Explore Products
              </Link>
            </motion.div>
          ) : (
            <div className={styles.cartGrid}>
              
              {/* Items List */}
              <div className={styles.itemsList}>
                <AnimatePresence mode="popLayout">
                  {cart.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                      transition={{ duration: 0.25, type: "spring", bounce: 0 }}
                      className={styles.cartItem}
                    >
                      <Link href={`/products/${item.slug}`} className={styles.itemImageWrapper}>
                        <img src={item.image} alt={item.name} className={styles.itemImage} />
                      </Link>

                      <div className={styles.itemInfo}>
                        <Link href={`/products/${item.slug}`} className={styles.itemName}>
                          {item.name}
                        </Link>
                        <div className={styles.itemPrice}>
                          {item.price}
                          {item.oldPrice && <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>{item.oldPrice}</span>}
                        </div>
                        {item.attributes && item.attributes.length > 0 && (
                          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {item.attributes.map((attr, idx) => (
                              <span key={idx} style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                                {attr.label}: <strong>{attr.value}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.itemActions}>
                        <div className={styles.quantitySelector}>
                          <button 
                            className={styles.qtyBtn} 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button 
                            className={styles.qtyBtn} 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          className={styles.removeBtn}
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={16} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className={styles.summaryPanel}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>
                
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Estimated Tax</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? "Free Delivery" : formatCurrency(deliveryFee)}</span>
                </div>

                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>

                <Link href="/checkout" style={{ textDecoration: 'none', display: 'block', width: '100%', marginTop: '32px' }}>
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    className={styles.checkoutBtn}
                    style={{ marginTop: 0 }}
                  >
                    Proceed to Checkout
                  </motion.button>
                </Link>

                <Link href="/" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    className={styles.continueShoppingBtn}
                  >
                    Continue Shopping
                  </motion.button>
                </Link>
                
                <div className={styles.secureCheckout}>
                  <ShieldCheck size={16} />
                  <span>Secure Encrypted Checkout</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
      </>
  );
}
