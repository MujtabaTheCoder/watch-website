"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setRegistered(true);
      setTimeout(() => {
        setRegistered(false);
        setEmail("");
      }, 4000);
    }
  };

  return (
    <footer className="bg-[#050507] border-t border-white/[0.08] text-[#F5F1E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand & Tagline (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl tracking-[0.28em] text-[#F5F1E8] group-hover:text-[#C6A15B] transition-colors uppercase font-semibold block">
                VELLORE
              </span>
              <span className="text-[8.5px] tracking-[0.34em] uppercase text-[#C6A15B] font-light block -mt-0.5 opacity-90">
                TIME, WORN BEAUTIFULLY.
              </span>
            </Link>

            <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed max-w-sm">
              Discover watches designed to sit quietly on your wrist and speak loudly about your taste. Minimal, elegant, made to be noticed.
            </p>

            {/* Newsletter quick form */}
            <div className="pt-2 max-w-sm">
              <span className="text-[10px] font-mono text-[#C6A15B] uppercase tracking-wider block font-semibold mb-2">
                GET FIRST ACCESS TO NEW DROPS
              </span>
              {registered ? (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Subscribed successfully.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 rounded-lg bg-[#111218] border border-white/10 text-xs font-mono text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B]/50 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#C6A15B] hover:bg-[#dfc299] text-[#08080B] text-xs font-mono font-semibold uppercase tracking-wider transition-colors shadow-md flex-shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 2: Shop */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono tracking-[0.24em] uppercase text-[#C6A15B] font-semibold">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-[#F5F1E8]/70">
              <li>
                <Link href="/shop" className="hover:text-[#C6A15B] transition-colors">
                  All Watches
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Classic" className="hover:text-[#C6A15B] transition-colors">
                  Classic
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Sport" className="hover:text-[#C6A15B] transition-colors">
                  Sport
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Minimal" className="hover:text-[#C6A15B] transition-colors">
                  Minimal
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Luxe" className="hover:text-[#C6A15B] transition-colors">
                  Luxe
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Gifting" className="hover:text-[#C6A15B] transition-colors">
                  Gifting
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Help */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono tracking-[0.24em] uppercase text-[#C6A15B] font-semibold">
              HELP
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-[#F5F1E8]/70">
              <li>
                <Link href="/track" className="text-[#C6A15B] hover:underline font-semibold flex items-center gap-1">
                  <span>Track Your Order</span>
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-[#C6A15B] transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-[#C6A15B] transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C6A15B] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C6A15B] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono tracking-[0.24em] uppercase text-[#C6A15B] font-semibold">
              COMPANY
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-[#F5F1E8]/70">
              <li>
                <Link href="/about" className="hover:text-[#C6A15B] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-[#C6A15B] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-[#C6A15B] transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/[0.06] py-6 text-[10.5px] font-mono text-[#F5F1E8]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 VELLORE. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-center">
            <span>Free delivery across Pakistan</span>
            <span className="text-[#C6A15B]">&bull;</span>
            <span>Cash on Delivery</span>
            <span className="text-[#C6A15B]">&bull;</span>
            <span>7-day easy returns</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
