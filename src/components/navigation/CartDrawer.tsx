"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Gift,
  Tag,
  ShoppingBag,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPKR } from "@/lib/format";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDiscountAmount,
    getDeliveryFee,
    getTotal,
    getTotalItems,
    discountCode,
    discountPercent,
    applyDiscountCode,
    removeDiscountCode,
    isGiftWrap,
    toggleGiftWrap,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const totalItems = getTotalItems();
  const freeThreshold = 15000;
  const progressPercent = Math.min(100, (subtotal / freeThreshold) * 100);
  const remainingForFree = Math.max(0, freeThreshold - subtotal);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyDiscountCode(promoInput);
    if (res.success) {
      setPromoMessage({ text: res.message, isError: false });
      setPromoInput("");
    } else {
      setPromoMessage({ text: res.message, isError: true });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer Panel: 100dvh for exact mobile screen height support */}
      <aside className="relative w-full sm:max-w-md bg-[#0B0B0F] border-l border-[#C6A15B]/20 flex flex-col h-[100dvh] max-h-[100dvh] z-10 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-white/10 flex items-center justify-between bg-[#0E0F13] flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 flex items-center justify-center text-[#C6A15B] flex-shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg tracking-wider text-[#F5F1E8]">
                YOUR CART
              </h2>
              <span className="text-[10px] font-mono text-[#C6A15B] uppercase tracking-widest block -mt-0.5">
                {totalItems} Timepiece{totalItems === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-white/10 text-[#F5F1E8]/70 hover:text-white transition-colors"
            aria-label="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 bg-[#121319] border-b border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5 font-light">
            <span className="flex items-center gap-1.5 text-[#F5F1E8]/90 text-[11px] truncate">
              <Truck className="w-3.5 h-3.5 text-[#C6A15B] flex-shrink-0" />
              {subtotal >= freeThreshold ? (
                <span className="text-emerald-400 font-medium">
                  Free Nationwide Delivery Unlocked!
                </span>
              ) : (
                <span className="truncate">
                  Add <strong className="text-[#C6A15B] font-mono">{formatPKR(remainingForFree)}</strong> for Free Delivery
                </span>
              )}
            </span>
            <span className="text-[10px] font-mono text-[#F5F1E8]/50 ml-2 flex-shrink-0">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C6A15B] via-[#dfc299] to-[#C6A15B] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Scrollable Items Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-[#16161D] border border-white/10 flex items-center justify-center text-[#C6A15B] mb-4 shadow-[0_0_20px_rgba(198,161,91,0.1)]">
                <ShoppingBag className="w-8 h-8 opacity-70" />
              </div>
              <p className="font-serif text-lg text-[#F5F1E8]">Your cart is empty</p>
              <p className="mt-1.5 text-xs text-[#F5F1E8]/50 max-w-xs leading-relaxed font-light">
                Discover our curated collection of luxury timepieces handcrafted for discerning taste.
              </p>
              <button
                onClick={closeCart}
                className="mt-5 px-6 py-2.5 rounded-full bg-[#C6A15B] text-[#0B0B0F] text-xs uppercase tracking-widest font-semibold hover:bg-[#dfc299] transition-all shadow-md"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {items.map((item) => {
                const activePrice = item.product.discount_price ?? item.product.price;
                const imageUrl = item.product.images[0] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80";

                return (
                  <div
                    key={item.product.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-[#14151B] border border-white/5 hover:border-[#C6A15B]/30 flex gap-3 items-center transition-all group"
                  >
                    {/* Thumbnail: slightly more compact on mobile to leave space for text */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black/60 flex-shrink-0 border border-white/10">
                      <Image
                        src={imageUrl}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-mono tracking-widest text-[#C6A15B] block truncate">
                            {item.product.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-medium text-[#F5F1E8] truncate">
                            {item.product.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-400/50 hover:text-red-400 p-1.5 rounded-lg transition-colors flex-shrink-0"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-xs font-mono font-semibold text-[#F5F1E8]">
                          {formatPKR(activePrice)}
                        </span>
                        {item.product.discount_price && (
                          <span className="text-[10px] line-through text-[#F5F1E8]/40 font-mono">
                            {formatPKR(item.product.price)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper: mobile touch-friendly size */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center border border-white/15 rounded-lg bg-[#0E0F13]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:text-[#C6A15B] text-[#F5F1E8]/70 active:scale-90 transition-transform"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-mono font-semibold text-[#F5F1E8]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:text-[#C6A15B] text-[#F5F1E8]/70 active:scale-90 transition-transform"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[11px] font-mono text-[#F5F1E8]/60">
                          {formatPKR(activePrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Complimentary Gift Box Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={toggleGiftWrap}
                  className={`w-full p-2.5 sm:p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isGiftWrap
                      ? "bg-[#C6A15B]/10 border-[#C6A15B]/40 text-[#C6A15B]"
                      : "bg-[#14151B] border-white/5 text-[#F5F1E8]/70 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Gift className="w-3.5 h-3.5 text-[#C6A15B] flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs truncate">Luxury Presentation Box &amp; Seal</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold flex-shrink-0">
                    {isGiftWrap ? "ADDED" : "+ ADD"}
                  </span>
                </button>
              </div>

              {/* Promo Code Input */}
              <div className="pt-1">
                {discountCode ? (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2 truncate">
                      <Tag className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="font-mono text-[11px] sm:text-xs truncate">
                        {discountCode} (-{discountPercent}%)
                      </span>
                    </div>
                    <button
                      onClick={removeDiscountCode}
                      className="text-[10px] text-red-400 hover:underline uppercase font-mono ml-2 flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. VELLORE10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 bg-[#14151B] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-xs text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 uppercase font-mono focus:outline-none focus:border-[#C6A15B]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#C6A15B] hover:text-[#0B0B0F] text-xs font-mono uppercase text-[#F5F1E8] font-semibold transition-colors flex-shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {promoMessage && (
                  <p
                    className={`mt-1.5 text-[11px] font-mono ${
                      promoMessage.isError ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Checkout CTA: safe-area aware on mobile */}
        {items.length > 0 && (
          <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-t border-white/10 bg-[#0E0F13] space-y-2.5 sm:space-y-3 flex-shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#F5F1E8]/70">
                <span>Subtotal</span>
                <span className="font-mono text-[#F5F1E8]">{formatPKR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({discountCode})</span>
                  <span className="font-mono">-{formatPKR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#F5F1E8]/70">
                <span>Nationwide Delivery</span>
                <span className="font-mono">
                  {deliveryFee === 0 ? (
                    <span className="text-[#C6A15B] font-medium">FREE</span>
                  ) : (
                    formatPKR(deliveryFee)
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-medium text-[#F5F1E8]">
                <span>Total Payable</span>
                <span className="font-mono text-base font-bold text-[#C6A15B]">
                  {formatPKR(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full py-3.5 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] active:scale-[0.98] text-[#0B0B0F] font-bold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(198,161,91,0.25)] font-mono"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-3 text-[10px] text-[#F5F1E8]/50 font-mono pt-0.5">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#C6A15B]" />
                100% Insured
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#C6A15B]" />
                Cash on Delivery
              </span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
