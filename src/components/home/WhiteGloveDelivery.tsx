"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Compass, MessageCircle, MapPin } from "lucide-react";
import { getWhatsAppConciergeUrl } from "@/lib/format";

export function WhiteGloveDelivery() {
  return (
    <section className="py-20 bg-[#070709] border-b border-white/[0.06] text-[#F5F1E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Hand Delivery Copy & Features (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#C6A15B] block font-semibold">
              PREMIUM HOROLOGY FOR PAKISTAN&apos;S DISCERNING PATRONS
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F5F1E8] tracking-tight leading-tight">
              Discreet, Insured, <br />
              <span className="italic font-light text-[#C6A15B]">White-Glove Hand Delivery.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-light leading-relaxed">
              Premium watchmaking has arrived in South Asia. No risks with international parcels or transit customs. Our dedicated delivery network brings prompt, scheduled deliveries direct to your doorstep with 100% insured delivery across all major cities and nationwide in Pakistan.
            </p>

            {/* 2 Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#0E0F14] border border-white/[0.08] space-y-1">
                <div className="flex items-center gap-2 text-[#C6A15B]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                    100% In-Transit Insured
                  </span>
                </div>
                <p className="text-[11px] text-[#F5F1E8]/60 font-light">
                  Protected packaging and insured logistics
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0E0F14] border border-white/[0.08] space-y-1">
                <div className="flex items-center gap-2 text-[#C6A15B]">
                  <Compass className="w-4 h-4" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                    Home Sizing &amp; Fitting
                  </span>
                </div>
                <p className="text-[11px] text-[#F5F1E8]/60 font-light">
                  Complimentary strap adjustments and gift packaging
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <a
                href={getWhatsAppConciergeUrl(
                  "Salam, I would like to inquire about watch delivery and availability."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#121319] hover:bg-[#C6A15B] border border-[#C6A15B]/40 hover:border-[#C6A15B] text-[#C6A15B] hover:text-[#08080B] text-xs font-mono font-semibold tracking-wider uppercase transition-all shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>CONNECT WITH ASSIGNED WATCHMAKER</span>
              </a>

              <span className="text-[10px] font-mono text-[#F5F1E8]/50">
                Direct response within 15 mins
              </span>
            </div>
          </div>

          {/* Right Column: Atelier Watchmaker Photograph with Floating Badge (6 cols) */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[380px] sm:h-[450px] w-full rounded-3xl overflow-hidden border border-[#C6A15B]/20 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=900&q=80"
                alt="Master Watchmaker at Atelier"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Floating Badge in Bottom-Left */}
              <div className="absolute bottom-5 left-5 right-5 sm:right-auto z-10 p-3.5 rounded-2xl bg-[#090A0E]/90 backdrop-blur-md border border-[#C6A15B]/30 flex items-center gap-3 shadow-xl">
                <div className="p-2 rounded-xl bg-[#C6A15B]/20 text-[#C6A15B]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-serif text-[#F5F1E8] font-medium">
                    Master Horologists
                  </h4>
                  <span className="text-[9.5px] font-mono tracking-widest text-[#C6A15B] uppercase block">
                    NATIONWIDE DISPATCH &amp; CERTIFICATION
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
