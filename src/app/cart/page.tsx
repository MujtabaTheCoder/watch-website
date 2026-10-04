"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { formatPKR } from "@/lib/format";
import { Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    getTotalItems,
  } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-[#0B0B0F]">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#16161D] border border-white/10 flex items-center justify-center text-[#C6A15B] mb-5">
          <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 opacity-60" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#F5F1E8]">Your Shopping Cart is Empty</h1>
        <p className="mt-2 text-xs sm:text-sm text-[#F5F1E8]/50 max-w-md">
          Explore our curated catalog of precision-engineered timepieces crafted for authority and elegance.
        </p>
        <Link
          href="/shop"
          className="mt-6 px-7 py-3 rounded-full bg-[#C6A15B] text-[#0B0B0F] font-semibold text-xs uppercase tracking-widest hover:bg-[#dfc299] transition-colors shadow-md"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-6 sm:mb-8 pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C6A15B] block">
              Cart Summary
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl text-[#F5F1E8] mt-0.5">
              Shopping Cart ({totalItems})
            </h1>
          </div>
          <Link
            href="/shop"
            className="text-xs font-mono text-[#C6A15B] hover:underline"
          >
            &larr; Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            {items.map((item) => {
              const activePrice = item.product.discount_price ?? item.product.price;
              const img = item.product.images[0] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80";

              return (
                <div
                  key={item.product.id}
                  className="p-3.5 sm:p-5 rounded-2xl bg-[#14151B] border border-white/5 hover:border-[#C6A15B]/20 flex items-center gap-3.5 sm:gap-6 transition-all"
                >
                  <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                    <Image
                      src={img}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 640px) 64px, 96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-[#C6A15B] block truncate">
                          {item.product.category}
                        </span>
                        <h3 className="font-serif text-sm sm:text-lg text-[#F5F1E8] truncate mt-0.5 font-medium">
                          {item.product.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-red-400/50 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-mono text-xs sm:text-sm font-semibold text-[#F5F1E8]">
                        {formatPKR(activePrice)}
                      </span>
                      {item.product.discount_price && (
                        <span className="text-[10px] line-through text-[#F5F1E8]/40 font-mono">
                          {formatPKR(item.product.price)}
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center border border-white/15 rounded-lg bg-[#0E0F13]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:text-[#C6A15B] text-[#F5F1E8]/70 active:scale-90 transition-transform"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 sm:w-8 text-center text-xs font-mono font-medium text-[#F5F1E8]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:text-[#C6A15B] text-[#F5F1E8]/70 active:scale-90 transition-transform"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-mono text-[#C6A15B] font-medium">
                        {formatPKR(activePrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4 rounded-2xl sm:rounded-3xl bg-[#14151B] border border-white/10 p-4 sm:p-6 space-y-5">
            <h2 className="font-serif text-lg sm:text-xl text-[#F5F1E8] pb-3 border-b border-white/10">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs text-[#F5F1E8]/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-[#F5F1E8]">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Nationwide Delivery</span>
                <span className="font-mono text-[#F5F1E8]">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-medium">FREE</span>
                  ) : (
                    formatPKR(deliveryFee)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between text-sm sm:text-base font-medium text-[#F5F1E8]">
                <span>Total Amount (PKR)</span>
                <span className="font-mono text-[#C6A15B] text-base sm:text-lg font-bold">
                  {formatPKR(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 sm:py-4 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] active:scale-[0.98] text-[#0B0B0F] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(198,161,91,0.25)] font-mono"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-2 text-[11px] text-[#F5F1E8]/50 pt-2 border-t border-white/5 font-mono">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#C6A15B] flex-shrink-0" />
                <span>Cash on Delivery available nationwide</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C6A15B] flex-shrink-0" />
                <span>100% Insured Open-Box Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
