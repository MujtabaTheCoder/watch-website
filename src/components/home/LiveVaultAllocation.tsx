"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, X, Plane, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { getWhatsAppConciergeUrl } from "@/lib/format";

export function LiveVaultAllocation() {
  const { items, removeItem, getSubtotal, getTotalItems } = useCartStore();

  // If user has items in cart, use them. If empty, provide default preview matching reference screenshot!
  const hasCartItems = items.length > 0;

  const displayItems = hasCartItems
    ? items.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        specs: i.product.description || "Swiss Calibre Automatic • Haute Horlogerie",
        price: i.product.price * i.quantity,
        image: i.product.images[0] || "https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=800&q=80",
        badge: "Armored Transit Included",
      }))
    : [
        {
          id: "showcase-aurelian-classic",
          name: "Aurelian Classic",
          specs: "Classic Gold-Tone • Cream Dial • Tan Leather Strap",
          price: 18500,
          image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
          badge: "Free Delivery Nationwide",
        },
        {
          id: "showcase-noir-meridian",
          name: "Noir Meridian",
          specs: "Matte Black Dial • Milanese Mesh • Modern Minimalist",
          price: 14900,
          image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
          badge: "Express COD Dispatch",
        },
      ];

  const totalPayable = hasCartItems
    ? getSubtotal()
    : displayItems.reduce((acc, curr) => acc + curr.price, 0);

  const itemCount = hasCartItems ? getTotalItems() : displayItems.length;

  return (
    <section
      id="vault-allocation-section"
      className="py-16 bg-[#08080A] border-b border-white/[0.06] text-[#F5F1E8]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0E0F14] border border-[#C6A15B]/30 p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Radial Glow (GPU-friendly radial gradient) */}
          <div
            className="absolute -top-24 -right-24 w-96 h-96 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(198,161,91,0.06) 0%, transparent 70%)",
            }}
          />

          {/* Section Card Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/[0.08] gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#C6A15B]/15 text-[#C6A15B] border border-[#C6A15B]/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif text-[#F5F1E8] tracking-tight">
                  Your Secured Vault Allocations
                </h3>
                <span className="text-[10px] font-mono text-[#F5F1E8]/50 uppercase tracking-widest">
                  CONFIDENTIAL TIMEPIECE RESERVATION
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-full bg-[#121319] border border-[#C6A15B]/30 text-[#C6A15B] font-semibold">
                {itemCount} ALLOCATED ITEMS
              </span>
            </div>
          </div>

          {/* 2-Column Vault Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Allocated Items List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#121319]/90 border border-white/[0.06] hover:border-white/15 transition-all gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#0A0B0E] border border-white/10 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-serif text-[#F5F1E8] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-mono text-[#F5F1E8]/60 truncate">
                        {item.specs}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-xs sm:text-sm font-serif font-bold text-[#C6A15B]">
                          PKR {item.price.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove action */}
                  {hasCartItems && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-[#F5F1E8]/40 hover:text-red-400 transition-colors"
                      title="Remove Allocation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {/* Transit Guarantee Protocol */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#F5F1E8]/70">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#C6A15B]" />
                  <span>Direct Flight/Armored Nationwide Transit</span>
                </div>
                <Link
                  href="/policies"
                  className="text-[10px] text-[#C6A15B] underline hover:text-[#dfc299] transition-colors"
                >
                  VIEW ALL TRANSIT PROTOCOLS (PKR 400,000+)
                </Link>
              </div>
            </div>

            {/* Right Column: Vault Settlement Breakdown (5 cols) */}
            <div className="lg:col-span-5 bg-[#121319] p-6 sm:p-7 rounded-2xl border border-white/[0.08] space-y-5">
              <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-[#C6A15B] block font-semibold">
                VAULT SETTLEMENT
              </span>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between text-[#F5F1E8]/70">
                  <span>Subtotal ({itemCount} Timepieces)</span>
                  <span className="text-[#F5F1E8]">PKR {totalPayable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#F5F1E8]/70">
                  <span>Free Insured Delivery (Pakistan)</span>
                  <span className="text-emerald-400 font-semibold">Complimentary</span>
                </div>
                <div className="flex justify-between text-[#F5F1E8]/70">
                  <span>Quality Assurance Check</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-baseline justify-between">
                  <span className="text-sm font-sans text-[#F5F1E8]">Total Payable:</span>
                  <span className="text-2xl font-serif font-bold text-[#C6A15B]">
                    PKR {totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-6 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] text-[#08080B] text-xs font-mono font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(198,161,91,0.25)]"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={getWhatsAppConciergeUrl(
                    `Salam, I am reviewing order for ${itemCount} timepiece(s) totaling PKR ${totalPayable.toLocaleString()}. Please arrange assistance.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-full border border-white/15 bg-white/[0.02] hover:border-[#C6A15B]/50 hover:bg-[#C6A15B]/10 text-[#F5F1E8] text-[11px] font-mono tracking-wider uppercase flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>INCLUDE COD / LIQUIDATION REVIEW</span>
                </a>
              </div>

              {/* Security Advisory Fine Print */}
              <p className="text-[10px] font-mono text-[#F5F1E8]/50 leading-relaxed text-center">
                Complimentary direct liaison verification protocol with private armoured delivery within 24-48 hours across Pakistan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
