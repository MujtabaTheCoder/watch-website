"use client";

import React, { useState } from "react";
import { Sparkles, Gift, Scale, MessageCircle, ChevronDown, Truck, RotateCcw, ShieldCheck, Check } from "lucide-react";

export function PatronRegistry() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const whyVelloreItems = [
    {
      title: "Thoughtful Design",
      desc: "Every piece is chosen for how it looks and feels on the wrist.",
      icon: Sparkles,
    },
    {
      title: "Gift-Ready",
      desc: "Premium packaging in every box.",
      icon: Gift,
    },
    {
      title: "Honest Pricing",
      desc: "Fair PKR prices with no hidden charges.",
      icon: Scale,
    },
    {
      title: "Support That Answers",
      desc: "Message us anytime and a real person replies.",
      icon: MessageCircle,
    },
  ];

  const faqs = [
    {
      q: "Do you offer Cash on Delivery?",
      a: "Yes, in most cities across Pakistan with open-parcel inspection option.",
    },
    {
      q: "How long does delivery take?",
      a: "Usually 2-5 working days via insured express couriers.",
    },
    {
      q: "Can I return or exchange a watch?",
      a: "Yes, within 7 days if it's unused and in its original packaging.",
    },
    {
      q: "Do the watches come with a warranty?",
      a: "Yes, all VELLORE watches include an official 1-year movement warranty with an included guarantee card.",
    },
    {
      q: "Is the watch water-resistant?",
      a: "It depends on the model. Check the details on each product page (ratings range from 3 ATM up to 10 ATM).",
    },
    {
      q: "How do I track my order?",
      a: "We'll send you an active tracking update by SMS and WhatsApp once your parcel ships.",
    },
  ];

  return (
    <section className="py-20 bg-[#090A0D] border-b border-white/[0.06] text-[#F5F1E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* ================= Why VELLORE Section ================= */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#C6A15B] block font-semibold">
              THE VELLORE DIFFERENCE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F5F1E8] tracking-tight">
              Why VELLORE
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-light max-w-lg mx-auto">
              Time, worn beautifully. Designed for everyday refinement and effortless confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyVelloreItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0E0F14] border border-white/[0.08] hover:border-[#C6A15B]/40 transition-all space-y-4 shadow-xl group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/15 text-[#C6A15B] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-lg text-[#F5F1E8]">{item.title}</h3>
                    <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= Shipping and Returns Banner ================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#121319] via-[#0E0F14] to-[#121319] border border-[#C6A15B]/25">
          <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C6A15B] block font-semibold">
              PEACE OF MIND GUARANTEE
            </span>
            <h3 className="text-xl sm:text-2xl font-serif text-[#F5F1E8]">
              Shipping &amp; Returns
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#08080B] border border-white/5 flex items-start gap-3">
              <Truck className="w-4 h-4 text-[#C6A15B] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F1E8] block text-[11px] uppercase">Fast Delivery</strong>
                <span className="text-[#F5F1E8]/65 text-[11px]">2-5 working days across Pakistan</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#08080B] border border-white/5 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#C6A15B] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F1E8] block text-[11px] uppercase">Cash on Delivery</strong>
                <span className="text-[#F5F1E8]/65 text-[11px]">Available nationwide in all major cities</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#08080B] border border-white/5 flex items-start gap-3">
              <RotateCcw className="w-4 h-4 text-[#C6A15B] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F1E8] block text-[11px] uppercase">7-Day Returns</strong>
                <span className="text-[#F5F1E8]/65 text-[11px]">Accepted if unused in original packaging</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#08080B] border border-white/5 flex items-start gap-3">
              <Check className="w-4 h-4 text-[#C6A15B] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F1E8] block text-[11px] uppercase">Free Shipping</strong>
                <span className="text-[#C6A15B] font-semibold text-[11px]">On orders above PKR 15,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FAQ Section ================= */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
            <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#C6A15B] block font-semibold">
              QUESTIONS &amp; ANSWERS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#F5F1E8]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0E0F14] border border-white/[0.08] hover:border-[#C6A15B]/30 transition-all overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors"
                  >
                    <span className="font-serif text-sm sm:text-base text-[#F5F1E8] font-medium">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#C6A15B] transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#F5F1E8]/70 font-light border-t border-white/[0.04] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

export const WhyVelloreAndFaq = PatronRegistry;
