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
  Check,
  Clock,
  Lock,
  Sparkles,
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
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

      {/* Drawer Panel */}
      <aside className="relative w-full max-w-md bg-[#0B0B0F] border-l border-[#C6A15B]/20 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#0E0F13]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 flex items-center justify-center text-[#C6A15B]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl tracking-wider text-[#F5F1E8]">
                YOUR SHOPPING CART
              </h2>
              <span className="text-[10px] font-mono text-[#C6A15B] uppercase tracking-widest block">
                {totalItems} Item{totalItems === 1 ? "" : "s"} in Cart
              </span>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-white/10 text-[#F5F1E8]/70 hover:text-white transition-colors"
            aria-label="Close Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-6 py-3 bg-[#121319] border-b border-white/5">
          <div className="flex items-center justify-between text-xs mb-1.5 font-light">
            <span className="flex items-center gap-1.5 text-[#F5F1E8]/80 text-[11px]">
              <Truck className="w-3.5 h-3.5 text-[#C6A15B]" />
              {subtotal >= freeThreshold ? (
                <span className="text-[#C6A15B] font-medium">
                  Complimentary Armored Courier Unlocked!
                </span>
              ) : (
                <span>
                  Add <strong className="text-[#C6A15B] font-mono">{formatPKR(remainingForFree)}</strong> for Free Delivery
                </span>
              )}
            </span>
            <span className="text-[10px] font-mono text-[#F5F1E8]/50">
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

        {/* Items List / Empty State */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#16161D] border border-white/10 flex items-center justify-center text-[#C6A15B] mb-4 shadow-[0_0_20px_rgba(198,161,91,0.1)]">
                <ShoppingBag className="w-8 h-8 opacity-70" />
              </div>
              <p className="font-serif text-xl text-[#F5F1E8]">Your cart is currently empty.</p>
              <p className="mt-2 text-xs text-[#F5F1E8]/50 max-w-xs leading-relaxed font-light">
                Discover our curated collection of luxury timepieces crafted for connoisseurs.
              </p>
              <button
                onClick={closeCart}
                className="mt-6 px-6 py-2.5 rounded-full bg-[#C6A15B] text-[#0B0B0F] text-xs uppercase tracking-widest font-semibold hover:bg-[#dfc299] transition-all shadow-md"
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const activePrice = item.product.discount_price ?? item.product.price;
                const imageUrl = item.product.images[0] || "/placeholder-watch.jpg";

                return (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-2xl bg-[#14151B] border border-white/5 hover:border-[#C6A15B]/30 flex gap-3.5 items-center transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/60 flex-shrink-0 border border-white/10">
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
                      <span className="text-[9px] uppercase font-mono tracking-widest text-[#C6A15B]">
                        {item.product.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-medium text-[#F5F1E8] truncate">
                        {item.product.name}
                      </h4>
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

                      {/* Quantity Selector & Trash */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center border border-white/15 rounded-lg bg-[#0E0F13]">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:text-[#C6A15B] text-[#F5F1E8]/70 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-mono text-[#F5F1E8]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:text-[#C6A15B] text-[#F5F1E8]/70 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-xs text-red-400/60 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Complimentary Gift Wrapping Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={toggleGiftWrap}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isGiftWrap
                      ? "bg-[#C6A15B]/10 border-[#C6A15B]/40 text-[#C6A15B]"
                      : "bg-[#14151B] border-white/5 text-[#F5F1E8]/70 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#C6A15B]" />
                    <span>Complimentary Luxury Presentation Box &amp; Wax Seal</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    {isGiftWrap ? "ADDED" : "+ ADD"}
                  </span>
                </button>
              </div>

              {/* Privilege Promo Code Form */}
              <div className="pt-1">
                {discountCode ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono">{discountCode} (-{discountPercent}%)</span>
                    </div>
                    <button
                      onClick={removeDiscountCode}
                      className="text-[10px] text-red-400 hover:underline uppercase font-mono"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (try VELLORE10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 bg-[#14151B] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 uppercase font-mono focus:outline-none focus:border-[#C6A15B]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#C6A15B] hover:text-[#0B0B0F] text-xs font-mono uppercase text-[#F5F1E8] transition-colors"
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

        {/* Footer with Checkout CTA */}
        {items.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-white/10 bg-[#0E0F13] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#F5F1E8]/70">
                <span>Atelier Subtotal</span>
                <span className="font-mono">{formatPKR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Privilege Privilege ({discountCode})</span>
                  <span className="font-mono">-{formatPKR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#F5F1E8]/70">
                <span>Insured Armored Courier</span>
                <span className="font-mono">
                  {deliveryFee === 0 ? (
                    <span className="text-[#C6A15B] font-medium">FREE</span>
                  ) : (
                    formatPKR(deliveryFee)
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-medium text-[#F5F1E8]">
                <span>Estimated Total (PKR)</span>
                <span className="font-mono text-base font-bold text-[#C6A15B]">
                  {formatPKR(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full py-3.5 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] text-[#0B0B0F] font-semibold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(198,161,91,0.25)] hover:shadow-[0_0_30px_rgba(198,161,91,0.45)]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-1 flex items-center justify-center gap-4 text-[10px] text-[#F5F1E8]/50 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#C6A15B]" />
                Open Box Verification
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
