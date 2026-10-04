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
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20 bg-[#0B0B0F]">
        <div className="w-20 h-20 rounded-full bg-[#16161D] border border-white/10 flex items-center justify-center text-[#C6A15B] mb-6">
          <ShoppingBag className="w-10 h-10 opacity-60" />
        </div>
        <h1 className="text-3xl font-serif text-[#F5F1E8]">Your Shopping Bag is Empty</h1>
        <p className="mt-2 text-sm text-[#F5F1E8]/50 max-w-md">
          Explore our curated catalog of precision-engineered timepieces crafted for authority and elegance.
        </p>
        <Link
          href="/shop"
          className="mt-8 px-8 py-3.5 rounded-full bg-[#C6A15B] text-[#0B0B0F] font-medium text-xs uppercase tracking-widest hover:bg-[#dfc299] transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] py-14">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F1E8] mb-8">
          Shopping Bag ({totalItems})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const activePrice = item.product.discount_price ?? item.product.price;
              const img = item.product.images[0] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80";

              return (
                <div
                  key={item.product.id}
                  className="p-5 rounded-2xl bg-[#14151B] border border-white/5 flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                    <Image
                      src={img}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#C6A15B]">
                      {item.product.category}
                    </span>
                    <h3 className="font-serif text-lg text-[#F5F1E8] mt-0.5">
                      {item.product.name}
                    </h3>
                    <div className="mt-1 font-mono text-sm text-[#F5F1E8]">
                      {formatPKR(activePrice)}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-white/10 rounded-full bg-[#0E0F13] p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-red-400/60 hover:text-red-400 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4 rounded-3xl bg-[#14151B] border border-white/10 p-6 space-y-6">
            <h2 className="font-serif text-xl text-[#F5F1E8] pb-4 border-b border-white/10">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-[#F5F1E8]/70">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-mono text-[#F5F1E8]">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Nationwide Delivery</span>
                <span className="font-mono text-[#F5F1E8]">
                  {deliveryFee === 0 ? (
                    <span className="text-[#C6A15B]">FREE</span>
                  ) : (
                    formatPKR(deliveryFee)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between text-base font-medium text-[#F5F1E8]">
                <span>Total Amount (PKR)</span>
                <span className="font-mono text-[#C6A15B] text-lg">{formatPKR(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] text-[#0B0B0F] font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(198,161,91,0.25)]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-2 text-[11px] text-[#F5F1E8]/50 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Cash on Delivery available nationwide</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Official 2-Year International Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
