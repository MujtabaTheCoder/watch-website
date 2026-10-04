"use client";

import React, { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { formatPKR } from "@/lib/format";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw, Box, Check } from "lucide-react";

// Dynamically import 3D viewer only when selected
const ProductViewer3D = dynamic(
  () => import("@/components/3d/ProductViewer3D").then((m) => m.ProductViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] sm:h-[500px] bg-[#16161D]/40 rounded-3xl border border-white/10 flex items-center justify-center">
        <span className="text-xs font-mono text-[#C6A15B] animate-pulse">
          Calibrating 3D Viewport...
        </span>
      </div>
    ),
  }
);

interface ProductInteractiveViewProps {
  product: Product;
}

export function ProductInteractiveView({ product }: ProductInteractiveViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"photos" | "3d">("photos");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCartStore();

  const activePrice = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price !== null && product.discount_price < product.price;
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Visual Presentation Column (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Toggle Switcher: Photos vs 3D */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex p-1 rounded-full bg-[#14151B] border border-white/10">
            <button
              onClick={() => setViewMode("photos")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-colors ${
                viewMode === "photos"
                  ? "bg-[#C6A15B] text-[#0B0B0F] font-medium"
                  : "text-[#F5F1E8]/70 hover:text-white"
              }`}
            >
              Gallery Photos
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-colors flex items-center gap-1.5 ${
                viewMode === "3d"
                  ? "bg-[#C6A15B] text-[#0B0B0F] font-medium"
                  : "text-[#F5F1E8]/70 hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Hologram</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-[#F5F1E8]/40">
            Ref: {product.slug.replace("vellore-", "").toUpperCase()}
          </span>
        </div>

        {/* Viewport Area */}
        {viewMode === "photos" ? (
          <div className="space-y-4">
            {/* Main Stage Image */}
            <div className="relative w-full aspect-square sm:h-[500px] rounded-3xl overflow-hidden bg-[#14151B] border border-white/10 shadow-2xl">
              <Image
                src={product.images[activeImageIndex] || product.images[0]}
                alt={`${product.name} view ${activeImageIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden bg-[#14151B] border transition-all flex-shrink-0 ${
                      activeImageIndex === idx
                        ? "border-[#C6A15B] scale-105 shadow-md"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <ProductViewer3D
            modelConfig={product.model_config}
            productName={product.name}
          />
        )}
      </div>

      {/* Details & Purchasing Actions Column (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#C6A15B]">
            {product.category} Collection
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-serif text-[#F5F1E8] leading-tight">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-2xl sm:text-3xl font-semibold text-[#F5F1E8]">
              {formatPKR(activePrice)}
            </span>
            {hasDiscount && (
              <span className="font-mono text-sm sm:text-base line-through text-[#F5F1E8]/40">
                {formatPKR(product.price)}
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
              Tax Included
            </span>
          </div>

          {/* Stock Availability */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                inStock ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            <span className="text-xs font-mono text-[#F5F1E8]/70">
              {inStock ? `In Stock for Immediate Dispatch (${product.stock} available)` : "Currently Sold Out"}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-light leading-relaxed">
          {product.description}
        </p>

        {/* Quantity & CTA Buttons */}
        {inStock && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#F5F1E8]/60 font-mono">Qty:</span>
              <div className="flex items-center border border-white/10 rounded-full bg-[#14151B] p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-xs"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-mono font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-full border font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                  justAdded
                    ? "bg-emerald-500 border-emerald-400 text-[#0B0B0F] shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    : "border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#C6A15B]/50 text-[#F5F1E8]"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] text-[#0B0B0F] font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(198,161,91,0.25)]"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now (COD)</span>
              </button>
            </div>
          </div>
        )}

        {/* Technical Horological Specifications */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
          <h4 className="text-xs uppercase font-mono tracking-widest text-[#C6A15B]">
            Product Details &amp; Specifications
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#14151B] border border-white/5">
              <span className="text-[10px] text-[#F5F1E8]/40 block uppercase">Case Size</span>
              <span className="text-[#F5F1E8] font-mono mt-0.5 block">{product.specs.case_size || "40mm"}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#14151B] border border-white/5">
              <span className="text-[10px] text-[#F5F1E8]/40 block uppercase">Movement</span>
              <span className="text-[#F5F1E8] font-mono mt-0.5 block">{product.specs.movement || "Quartz"}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#14151B] border border-white/5">
              <span className="text-[10px] text-[#F5F1E8]/40 block uppercase">Water Resistance</span>
              <span className="text-[#F5F1E8] font-mono mt-0.5 block">{product.specs.water_resistance || "3 ATM"}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#14151B] border border-white/5">
              <span className="text-[10px] text-[#F5F1E8]/40 block uppercase">Warranty</span>
              <span className="text-[#F5F1E8] font-mono mt-0.5 block">{product.specs.warranty || "1-Year Official Warranty"}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#14151B] border border-white/5">
            <span className="text-[10px] text-[#F5F1E8]/40 block uppercase">Strap Material</span>
            <span className="text-[#F5F1E8] font-mono mt-0.5 block">{product.specs.strap || "Genuine Leather"}</span>
          </div>

          {/* In the box */}
          <div className="p-3.5 rounded-xl bg-[#14151B] border border-[#C6A15B]/20 space-y-1">
            <span className="text-[10px] text-[#C6A15B] block uppercase font-mono tracking-wider font-semibold">
              IN THE BOX
            </span>
            <span className="text-xs text-[#F5F1E8]/90 font-mono block">
              {product.specs.in_the_box || "Watch · Gift box · Care card"}
            </span>
          </div>
        </div>

        {/* Guarantees Strip */}
        <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-[#F5F1E8]/60 font-light">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#C6A15B]" />
            <span>Complimentary delivery across Pakistan (2-4 business days).</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
            <span>Cash on Delivery with open-parcel inspection option.</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#C6A15B]" />
            <span>7-day unworn exchange warranty.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
