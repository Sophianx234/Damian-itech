import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string | number;
  slug: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  quantity: number;
  stock?: number;
  attributes?: { label: string; value: string }[];
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      
      addToCart: (newItem) => set((state) => {
        const existing = state.cart.find((item) => item.id === newItem.id);
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: newItem.quantity }
                : item
            )
          };
        }
        return { cart: [...state.cart, newItem] };
      }),

      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== id)
      })),

      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return { cart: state.cart.filter((item) => item.id !== id) };
        }
        return {
          cart: state.cart.map((item) => {
            if (item.id === id) {
              if (item.stock !== undefined && quantity > item.stock) {
                return { ...item, quantity: item.stock };
              }
              return { ...item, quantity };
            }
            return item;
          })
        };
      }),

      clearCart: () => set({ cart: [] }),

      // Derived state getters
      getCartCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      getCartTotal: () => {
        return get().cart.reduce((total, item) => {
          const numericPrice = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
          return total + (isNaN(numericPrice) ? 0 : numericPrice * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'damian-itech-cart', // Unique localStorage key
      skipHydration: true, // Let consumers handle hydration if needed to avoid mismatches
    }
  )
);
