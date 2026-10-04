"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPKR } from "@/lib/format";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Eye, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCartStore();

  const activePrice = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price !== null && product.discount_price < product.price;
  const primaryImage = product.images[0] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80";

  // Lightweight 3D tilt effect on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
      className="group relative rounded-2xl bg-[#14151B] border border-white/10 hover:border-[#C6A15B]/40 hover:shadow-[0_12px_40px_rgba(198,161,91,0.15)] flex flex-col overflow-hidden transition-colors duration-300"
    >
      {/* Category & Badge Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-[#0B0B0F]/80 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase">
          {product.category}
        </span>
        {product.stock <= 5 && product.stock > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300">
            {product.stock} Left
          </span>
        )}
      </div>

      {/* Image Viewport with Lift Effect */}
      <Link
        href={`/watches/${product.slug}`}
        className="relative w-full aspect-square bg-[#0E0F13] overflow-hidden block"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          priority={false}
        />
        {/* Soft dark vignette gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14151B] via-transparent to-transparent opacity-60" />

        {/* Floating Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <span className="px-4 py-2 rounded-full bg-[#C6A15B] text-[#0B0B0F] text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5" />
            Inspect Watch
          </span>
        </div>
      </Link>

      {/* Product Details Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/watches/${product.slug}`}>
            <h3 className="font-serif text-lg text-[#F5F1E8] group-hover:text-[#C6A15B] transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1.5 text-xs text-[#F5F1E8]/50 line-clamp-2 font-light leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add to Bag */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-base font-semibold text-[#F5F1E8]">
                {formatPKR(activePrice)}
              </span>
              {hasDiscount && (
                <span className="font-mono text-xs line-through text-[#F5F1E8]/40">
                  {formatPKR(product.price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#F5F1E8]/40 uppercase tracking-wider">
              Free Delivery
            </span>
          </div>

          <button
            onClick={() => {
              addItem(product, 1);
              setJustAdded(true);
              setTimeout(() => setJustAdded(false), 1800);
            }}
            className={`p-2.5 rounded-full border transition-all duration-300 ${
              justAdded
                ? "bg-emerald-500 border-emerald-400 text-[#0B0B0F] scale-110 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                : "bg-[#1A1C24] border-white/10 hover:border-[#C6A15B] hover:bg-[#C6A15B] text-[#F5F1E8] hover:text-[#0B0B0F]"
            }`}
            aria-label={`Add ${product.name} to Bag`}
          >
            {justAdded ? <Check className="w-4 h-4 stroke-[3]" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
