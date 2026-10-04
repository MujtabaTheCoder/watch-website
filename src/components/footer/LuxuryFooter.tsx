"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Clock, ArrowRight, Check } from "lucide-react";

export function LuxuryFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#050506] border-t border-white/[0.08] pt-16 pb-12 text-xs text-[#8e9099]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Outfitter Newsletter Bar */}
        <div className="pb-14 mb-14 border-b border-white/[0.06] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#c5a880] font-sans font-medium block">
              The Outfitter Club
            </span>
            <h3 className="font-serif text-2xl text-[#f5f2eb]">
              Receive 10% Off Your First Timepiece
            </h3>
            <p className="text-xs text-[#8e9099]">
              Subscribe for priority seasonal drop announcements, lookbook features, and curated horology insights.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Welcome to the club. Your 10% privilege code is: <strong>OUTFITTER10</strong></span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#121316] border border-white/10 text-xs text-[#f5f2eb] px-4 py-3 rounded-sm focus:outline-none focus:border-[#c5a880]/50 flex-1"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#c5a880] hover:bg-[#dfc299] text-[#08080a] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all whitespace-nowrap"
                >
                  Join Club
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-white/[0.06]">
          {/* Brand Presentation (Col 1-2) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="font-serif tracking-[0.22em] text-xl md:text-2xl font-medium text-[#f5f2eb] group-hover:text-[#c5a880] transition-colors uppercase">
                VELLORE OUTFITTERS
              </span>
              <span className="text-[8.5px] tracking-[0.35em] text-[#c5a880]/85 uppercase font-sans block mt-0.5">
                Curated Timepieces & Daily Horology
              </span>
            </Link>
            <p className="text-xs text-[#8e9099] leading-relaxed max-w-sm tracking-wide">
              Curated timepieces built for daily utility and timeless distinction. Certified authentic, delivered worldwide with comprehensive 2-year warranty protection.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-[11px] text-[#c8c5bc]">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Complimentary Express Worldwide Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>100% Certified Authentic with Inspection Certificate</span>
              </div>
            </div>
          </div>

          {/* Col 3: Shop */}
          <div>
            <h4 className="font-serif text-sm text-[#f5f2eb] uppercase tracking-[0.18em] mb-4">
              Shop Watches
            </h4>
            <ul className="space-y-2.5 text-[#8e9099]">
              <li>
                <Link href="/watches?sort=newest" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/watches" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  All Timepieces
                </Link>
              </li>
              <li>
                <Link href="/watches?category=mens" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Men&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/watches?category=womens" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Women&apos;s Edit
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Curated Brands
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: The Brand */}
          <div>
            <h4 className="font-serif text-sm text-[#f5f2eb] uppercase tracking-[0.18em] mb-4">
              The Outfitter
            </h4>
            <ul className="space-y-2.5 text-[#8e9099]">
              <li>
                <Link href="/about" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Lookbook & Journal
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Authenticity Guarantee
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Customer Care */}
          <div>
            <h4 className="font-serif text-sm text-[#f5f2eb] uppercase tracking-[0.18em] mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-[#8e9099]">
              <li>
                <Link href="/track-order" className="hover:text-[#c5a880] transition-colors tracking-wide text-[#c5a880]">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Member Account
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Saved Pieces
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#c5a880] transition-colors tracking-wide">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#8e9099]">
          <p>© {new Date().getFullYear()} VELLORE OUTFITTERS LLC. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-[#c5a880] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-[#c5a880] transition-colors">
              Terms of Service
            </Link>
            <Link href="/track-order" className="hover:text-[#c5a880] transition-colors">
              Order Tracking
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
