import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  showToast: boolean;
  lastAddedItem: { product: Product; quantity: number } | null;
  discountCode: string | null;
  discountPercent: number;
  isGiftWrap: boolean;
  giftNote: string;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  hideToast: () => void;
  applyDiscountCode: (code: string) => { success: boolean; message: string };
  removeDiscountCode: () => void;
  toggleGiftWrap: () => void;
  setGiftNote: (note: string) => void;

  // Computations
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      showToast: false,
      lastAddedItem: null,
      discountCode: null,
      discountPercent: 0,
      isGiftWrap: false,
      giftNote: "",

      addItem: (product: Product, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.product.id === product.id);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const currentQty = updated[existingIndex].quantity;
          const maxStock = product.stock || 10;
          updated[existingIndex].quantity = Math.min(currentQty + quantity, maxStock);
          set({
            items: updated,
            isOpen: true,
            showToast: true,
            lastAddedItem: { product, quantity },
          });
        } else {
          set({
            items: [
              ...currentItems,
              { product, quantity: Math.min(quantity, product.stock || 10) },
            ],
            isOpen: true,
            showToast: true,
            lastAddedItem: { product, quantity },
          });
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) => {
            if (i.product.id === productId) {
              const maxStock = i.product.stock || 10;
              return { ...i, quantity: Math.min(quantity, maxStock) };
            }
            return i;
          }),
        });
      },

      clearCart: () =>
        set({
          items: [],
          discountCode: null,
          discountPercent: 0,
          isGiftWrap: false,
          giftNote: "",
        }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      hideToast: () => set({ showToast: false }),

      applyDiscountCode: (rawCode: string) => {
        const code = rawCode.trim().toUpperCase();
        if (code === "VELLORE10" || code === "WELCOME10" || code === "SAVE10" || code === "VIP10") {
          set({ discountCode: code, discountPercent: 10 });
          return { success: true, message: "10% Special Discount Applied!" };
        } else if (code === "WELCOME5") {
          set({ discountCode: code, discountPercent: 5 });
          return { success: true, message: "5% Welcome Discount Applied!" };
        } else {
          return { success: false, message: "Invalid or expired promo code." };
        }
      },

      removeDiscountCode: () => set({ discountCode: null, discountPercent: 0 }),
      toggleGiftWrap: () => set((state) => ({ isGiftWrap: !state.isGiftWrap })),
      setGiftNote: (giftNote: string) => set({ giftNote }),

      getSubtotal: () => {
        return get().items.reduce((acc, item) => {
          const price = item.product.discount_price ?? item.product.price;
          return acc + price * item.quantity;
        }, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const percent = get().discountPercent;
        if (percent <= 0) return 0;
        return Math.round((subtotal * percent) / 100);
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= 15000 ? 0 : 250;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const delivery = get().getDeliveryFee();
        return Math.max(0, subtotal - discount + delivery);
      },

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: "vellore-cart-storage",
      partialize: (state) => ({
        items: state.items,
        discountCode: state.discountCode,
        discountPercent: state.discountPercent,
        isGiftWrap: state.isGiftWrap,
        giftNote: state.giftNote,
      }),
    }
  )
);
