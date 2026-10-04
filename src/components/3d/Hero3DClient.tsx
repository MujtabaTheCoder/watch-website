"use client";

import React from "react";
import dynamic from "next/dynamic";

export const HeroScene = dynamic(
  () => import("@/components/3d/HeroScene").then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => (
      <section className="relative w-full h-[92vh] min-h-[640px] flex items-center justify-center bg-[#0B0B0F] overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C6A15B]/10 rounded-full blur-[120px]" />
        <div className="text-center space-y-4 relative z-10 px-6">
          <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-[#C6A15B]">
            Atelier Horlogerie &bull; Pakistan
          </span>
          <h1 className="text-5xl sm:text-7xl font-serif text-[#F5F1E8] tracking-tight">
            TIME, REFINED.
          </h1>
          <p className="text-sm text-[#F5F1E8]/60 font-light max-w-md mx-auto">
            Meticulously engineered horology designed for the modern connoisseur.
          </p>
        </div>
      </section>
    ),
  }
);

export const ScrollStoryScene = dynamic(
  () => import("@/components/3d/ScrollStoryScene").then((mod) => mod.ScrollStoryScene),
  {
    ssr: false,
  }
);
