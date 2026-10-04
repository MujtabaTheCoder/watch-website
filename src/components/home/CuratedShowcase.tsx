"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Lock, Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/types";

interface ShowcaseWatch {
  id: string;
  name: string;
  slug: string;
  tag: string;
  badgeLeft: string;
  badgeRight?: string;
  specsText: string;
  price: number;
  originalPrice?: number;
  extraBadge?: string;
  image: string;
}

const showcaseWatches: ShowcaseWatch[] = [
  {
    id: "showcase-aurelian-classic",
    name: "Aurelian Classic",
    slug: "aurelian-classic",
    tag: "CLASSIC COLLECTION",
    badgeLeft: "FREE NATIONWIDE DELIVERY",
    badgeRight: "BESTSELLER",
    specsText: "Slim gold-tone case • Cream dial • Tan leather strap",
    price: 18500,
    originalPrice: 22000,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
  },
  {
    id: "showcase-noir-meridian",
    name: "Noir Meridian",
    slug: "noir-meridian",
    tag: "MINIMAL COLLECTION",
    badgeLeft: "ULTRA-SLIM PROFILE",
    badgeRight: "COD AVAILABLE",
    specsText: "Matte black dial • Mesh strap • Modern quiet design",
    price: 14900,
    originalPrice: 17500,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
  },
  {
    id: "showcase-vanta-chrono",
    name: "Vanta Chrono",
    slug: "vanta-chrono",
    tag: "SPORT COLLECTION",
    badgeLeft: "STEEL BRACELET",
    badgeRight: "DAILY WEAR",
    specsText: "Precision chronograph • Solid steel bracelet • 5 ATM",
    price: 22000,
    originalPrice: 26000,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
  },
  {
    id: "showcase-seraphine-rose",
    name: "Seraphine Rose",
    slug: "seraphine-rose",
    tag: "LUXE COLLECTION",
    badgeLeft: "ROSE-GOLD FINISH",
    badgeRight: "SPECIAL OCCASION",
    specsText: "Mother-of-pearl dial • Curved sapphire crystal • 36mm",
    price: 27500,
    originalPrice: 32000,
    image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80",
  },
];

export function CuratedShowcase() {
  const { addItem } = useCartStore();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAcquire = (watch: ShowcaseWatch) => {
    const product: Product = {
      id: watch.id,
      name: watch.name,
      slug: watch.slug,
      description: watch.specsText,
      price: watch.price,
      discount_price: watch.originalPrice || null,
      category: "Luxury",
      images: [watch.image],
      specs: {
        case_size: "42mm",
        movement: "Swiss Calibre Automatic",
        strap: "Alligator & Saffiano Leather",
        water_resistance: "10 ATM",
        glass: "Double Anti-Reflective Sapphire",
        warranty: "5-Year International",
      },
      model_config: {
        case_color: "#C6A15B",
        dial_color: "#08080B",
        strap_color: "#181512",
        accents: "#C6A15B",
      },
      stock: 4,
      featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addItem(product, 1);
    setAddedId(watch.id);

    // Scroll slightly down to Vault Allocation card if user wants to see it
    const vaultSection = document.getElementById("vault-allocation-section");
    if (vaultSection) {
      vaultSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => {
      setAddedId(null);
    }, 2500);
  };

  return (
    <section className="py-20 bg-[#070709] border-b border-white/[0.06] text-[#F5F1E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#C6A15B] block font-semibold">
              &bull; EXCLUSIVE REGISTRY &bull; 2025 SELECTION
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F5F1E8] tracking-tight mt-1">
              Curated Showcase
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121319] border border-[#C6A15B]/30 text-[11px] font-mono text-[#C6A15B]">
            <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
            <span className="tracking-widest uppercase">VERIFIED AUTHENTIC TIMEPIECES</span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcaseWatches.map((watch) => {
            const isJustAdded = addedId === watch.id;

            return (
              <div
                key={watch.id}
                className="group relative rounded-2xl bg-[#0E0F14] border border-white/[0.08] hover:border-[#C6A15B]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
              >
                {/* Watch Image with Badges */}
                <div className="relative w-full h-56 bg-[#060608] overflow-hidden">
                  <Image
                    src={watch.image}
                    alt={watch.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0F14] via-transparent to-black/50" />

                  {/* Top-Left Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#08080B]/90 backdrop-blur-md border border-[#C6A15B]/40 text-[8.5px] font-mono text-[#C6A15B] tracking-wider uppercase font-semibold">
                      <span className="w-1 h-1 rounded-full bg-[#C6A15B]" />
                      {watch.badgeLeft}
                    </span>
                  </div>

                  {/* Top-Right Badge (if any) */}
                  {watch.badgeRight && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2 py-0.5 rounded-full bg-[#C6A15B] text-[#08080B] text-[8.5px] font-mono font-bold tracking-wider">
                        {watch.badgeRight}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#C6A15B] block font-semibold">
                      {watch.tag}
                    </span>
                    <h3 className="text-lg font-serif text-[#F5F1E8] group-hover:text-[#C6A15B] transition-colors leading-snug">
                      {watch.name}
                    </h3>
                    <p className="text-[11px] text-[#F5F1E8]/60 font-mono leading-relaxed line-clamp-2">
                      {watch.specsText}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                    <div className="flex items-baseline justify-between">
                      <div>
                        {watch.originalPrice && (
                          <span className="text-[10px] font-mono line-through text-[#F5F1E8]/40 block">
                            PKR {watch.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-base sm:text-lg font-serif font-bold text-[#C6A15B] tracking-tight">
                          PKR {watch.price.toLocaleString()}
                        </span>
                      </div>

                      {watch.extraBadge && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#F5F1E8]/70">
                          {watch.extraBadge}
                        </span>
                      )}
                    </div>

                    {/* Acquire to Vault CTA Button */}
                    <button
                      onClick={() => handleAcquire(watch)}
                      disabled={isJustAdded}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
                        isJustAdded
                          ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                          : "bg-[#C6A15B]/15 hover:bg-[#C6A15B] border border-[#C6A15B]/40 hover:border-[#C6A15B] text-[#C6A15B] hover:text-[#08080B]"
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>ALLOCATED TO VAULT</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>ACQUIRE TO VAULT</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
