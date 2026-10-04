"use client";

import React from "react";
import Image from "next/image";

interface CalibreCardProps {
  badge: string;
  badgePill?: string;
  category: string;
  title: string;
  description: string;
  image: string;
  footerLeft: string;
  footerRight: string;
}

const calibreCards: CalibreCardProps[] = [
  {
    badge: "CALIBRE 01",
    category: "BEZEL & DIAL ASSEMBLY",
    title: "Hand-Engraved Dial",
    description:
      "Hermetically sealed dial with hand-applied chamfered indices and anti-reflective sapphire crystal with dual-side anti-glare.",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
    footerLeft: "Finish: Damascus Enamel",
    footerRight: "18k Rose Markers",
  },
  {
    badge: "CALIBRE 02",
    category: "AERO CASE",
    title: "Titanium & 18k Bezel",
    description:
      "Grade 5 titanium aerospace case ring paired with a mirror-polished 18k champagne gold bezel with hand-bevelled edges and solar chamfers.",
    image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80",
    footerLeft: "Titanium Grade 5",
    footerRight: "43.5mm Case",
  },
  {
    badge: "CALIBRE 03",
    badgePill: "72H",
    category: "POWER GENERATION - 4HZ",
    title: "72h Reserve Engine",
    description:
      "Twin-barrel architecture powering the tourbillon assembly with constant torque delivery for unmatched rate stability under all conditions.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
    footerLeft: "Jewels: 33 Rubies",
    footerRight: "72-Hour Reserve",
  },
  {
    badge: "CALIBRE 04",
    category: "BRACELET",
    title: "Saffiano & Alligator",
    description:
      "Hand-stitched by master leather ateliers with quick-release hypoallergenic titanium deployant buckles. Additional rubber strap included.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    footerLeft: "Hardware: 18k Clasp",
    footerRight: "Lug: 22mm",
  },
];

export function CalibreAnatomy() {
  return (
    <section className="py-20 bg-[#090A0D] border-b border-white/[0.06] text-[#F5F1E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Subtitle, Title on Left, Specs on Right */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#C6A15B] block font-semibold">
              ANATOMY OF HOROLOGICAL PERFECTION
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F5F1E8] tracking-tight leading-tight">
              Calibre Anatomy &amp; Exploded Architecture
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#F5F1E8]/70 leading-relaxed bg-[#101116]/80 p-4 rounded-xl border border-white/[0.08]">
              HAUTE PRECISION AT 4HZ (28,800 VPH) WITH 71-DAY HAND-FINISHING. BLAZING SWISS MICRO-MECHANICS WITH SIGNATURE FAUX-COTE DE GENÈVE.
            </p>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {calibreCards.map((card, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl bg-[#101117] border border-white/[0.08] hover:border-[#C6A15B]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-[0_8px_30px_rgba(198,161,91,0.1)]"
            >
              {/* Image with Badges */}
              <div className="relative w-full h-52 bg-[#060608] overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101117] via-transparent to-black/40" />

                {/* Top-Left Pill Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#08080B]/90 backdrop-blur-md border border-[#C6A15B]/30 text-[9px] font-mono text-[#C6A15B] tracking-widest font-semibold uppercase">
                    {card.badge}
                  </span>
                </div>

                {/* Optional Right Pill */}
                {card.badgePill && (
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-[#C6A15B] text-[#08080B] text-[8.5px] font-mono font-bold tracking-wider">
                      {card.badgePill}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9.5px] font-mono uppercase tracking-[0.22em] text-[#C6A15B] block font-semibold">
                    {card.category}
                  </span>
                  <h3 className="text-xl font-serif text-[#F5F1E8] group-hover:text-[#C6A15B] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#F5F1E8]/70 leading-relaxed font-light">
                    {card.description}
                  </p>
                </div>

                {/* Card Footer Details */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-[#F5F1E8]/60">
                  <span>{card.footerLeft}</span>
                  <span className="text-[#C6A15B]">{card.footerRight}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
