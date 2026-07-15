"use client";

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  // ZUSTAND: Select only specific state slices to prevent unnecessary re-renders
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const getCartCount = useCartStore((state) => state.getCartCount);

  if (!isOpen) {
    return (
      <button className={styles.toggleBtn} onClick={() => setIsOpen(true)}>
        Cart ({getCartCount()})
      </button>
    );
  }

  return (
    <div className={styles.drawerOverlay} onClick={() => setIsOpen(false)}>
      <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h2>Your Cart ({getCartCount()})</h2>
          <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>Close</button>
        </div>

        {cart.length === 0 ? (
          <div className={styles.emptyState}>Your cart is empty.</div>
        ) : (
          <div className={styles.itemsList}>
            {cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <img src={item.image} alt={item.name} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemPrice}>{item.price}</p>
                  <div className={styles.quantityControls}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className={styles.removeBtn}>Remove</button>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Total:</span>
              <span>₵{getCartTotal().toLocaleString()}</span>
            </div>
            <button onClick={clearCart} className={styles.clearBtn}>Clear Cart</button>
            <button className={styles.checkoutBtn}>Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
}
