"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  category: string;
  technique: string;
  material: string;
  unitPrice: number;
  quantity: number;
  customization: string;
  imageUrl?: string;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const newQty = existing.quantity + (item.quantity ?? 1);
            const limited = existing.maxStock != null ? Math.min(newQty, existing.maxStock) : newQty;
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: limited } : i
              ),
            };
          }
          const initialQty = item.quantity ?? 1;
          const limited = item.maxStock != null ? Math.min(initialQty, item.maxStock) : initialQty;
          return { items: [...state.items, { ...item, quantity: limited }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId !== productId) return i;
            const limited = i.maxStock != null ? Math.min(quantity, i.maxStock) : quantity;
            return { ...i, quantity: limited };
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    }),
    { name: "arte-madisa-cart" }
  )
);
