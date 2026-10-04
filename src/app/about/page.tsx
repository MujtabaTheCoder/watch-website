import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, Gem } from "lucide-react";

export const metadata = {
  title: "The Maison Story | VELLORE",
  description: "Learn about VELLORE's philosophy of horological refinement, honest pricing, and timeless aesthetics in Pakistan.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] py-16">
      <div className="max-w-5xl mx-auto px-6 space-y-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-[#C6A15B]">
            About Us
          </span>
          <h1 className="mt-2 text-4xl sm:text-5xl font-serif text-[#F5F1E8]">
            Time, worn beautifully.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#F5F1E8]/80 font-light leading-relaxed">
            VELLORE started with a simple idea: a good watch should feel personal. We pick designs that balance elegance and everyday comfort, so you can wear them to work, to dinner, or to a wedding without a second thought. Every order is packed with care and delivered to your door.
          </p>
        </div>

        {/* Feature Image */}
        <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80"
            alt="VELLORE Timepieces"
            fill
            sizes="(max-width: 1024px) 100vw, 1000px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-transparent" />
        </div>

        {/* Why VELLORE Grid */}
        <div className="space-y-6 pt-4">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#C6A15B] block font-semibold">
              OUR STANDARDS
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-serif text-[#F5F1E8]">
              Why VELLORE
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-[#14151B] border border-white/5 space-y-2">
              <Compass className="w-6 h-6 text-[#C6A15B]" />
              <h3 className="font-serif text-lg text-[#F5F1E8]">Thoughtful Design</h3>
              <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
                Every piece is chosen for how it looks and feels on the wrist.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#14151B] border border-white/5 space-y-2">
              <Gem className="w-6 h-6 text-[#C6A15B]" />
              <h3 className="font-serif text-lg text-[#F5F1E8]">Gift-Ready</h3>
              <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
                Premium packaging in every box.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#14151B] border border-white/5 space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#C6A15B]" />
              <h3 className="font-serif text-lg text-[#F5F1E8]">Honest Pricing</h3>
              <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
                Fair PKR prices with no hidden charges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#14151B] border border-white/5 space-y-2">
              <ArrowRight className="w-6 h-6 text-[#C6A15B]" />
              <h3 className="font-serif text-lg text-[#F5F1E8]">Support That Answers</h3>
              <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
                Message us anytime and a real person replies.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C6A15B] text-[#0B0B0F] font-medium text-xs uppercase tracking-widest hover:bg-[#dfc299] transition-colors"
          >
            <span>Explore the Timepieces</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
