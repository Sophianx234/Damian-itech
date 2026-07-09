"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string | number;
  slug: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  stock?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedCart = localStorage.getItem('technest_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart from local storage", e);
      }
    }
  }, []);

  // Sync to localStorage on cart change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('technest_cart', JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === newItem.id);
      if (existing) {
        return prev.map(item => 
          item.id === newItem.id ? { ...item, quantity: newItem.quantity } : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (item.stock !== undefined && quantity > item.stock) {
          return { ...item, quantity: item.stock };
        }
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = mounted ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
  
  const cartTotal = mounted ? cart.reduce((total, item) => {
    // Parse currency strings like "$499.00" to float 499.00
    const numericPrice = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
    return total + (isNaN(numericPrice) ? 0 : numericPrice * item.quantity);
  }, 0) : 0;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
