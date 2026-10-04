"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, X, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPKR } from "@/lib/format";

export function AddToCartNotification() {
  const { showToast, hideToast, lastAddedItem, openCart } = useCartStore();

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast, hideToast]);

  if (!showToast || !lastAddedItem) return null;

  const product = lastAddedItem.product;
  const activePrice = product.discount_price ?? product.price;
  const imageUrl = product.images[0] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80";

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-[110] max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="rounded-2xl bg-[#0E0F13]/95 backdrop-blur-xl border border-[#C6A15B]/40 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Subtle Gold Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent animate-pulse" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C6A15B]">
              Added to Cart
            </span>
          </div>

          <button
            onClick={hideToast}
            className="p-1 rounded-full hover:bg-white/10 text-[#F5F1E8]/60 hover:text-white transition-colors"
            aria-label="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="py-3 flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-serif text-[#F5F1E8] truncate font-medium">
              {product.name}
            </h4>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-xs text-[#C6A15B] font-semibold">
                {formatPKR(activePrice)}
              </span>
              <span className="text-[10px] text-[#F5F1E8]/50 font-mono">
                Qty: {lastAddedItem.quantity}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => {
              hideToast();
              openCart();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-[#C6A15B] hover:bg-[#dfc299] text-[#0B0B0F] font-mono text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Open Cart</span>
          </button>

          <Link
            href="/checkout"
            onClick={hideToast}
            className="flex-1 py-2 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-[#F5F1E8] font-mono text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
