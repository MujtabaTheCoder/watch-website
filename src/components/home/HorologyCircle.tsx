"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

export function HorologyCircle() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 4000);
    }
  };

  return (
    <section className="py-16 bg-[#070709] border-b border-white/[0.06] text-[#F5F1E8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0E0F14] border border-[#C6A15B]/35 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#C6A15B] block font-semibold">
              NEWSLETTER
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#F5F1E8]">
              Get first access to new drops.
            </h3>
            <p className="text-xs sm:text-sm text-[#F5F1E8]/70 max-w-xl mx-auto font-light leading-relaxed">
              No spam, just new arrivals and offers.
            </p>
          </div>

          {submitted ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <Check className="w-4 h-4" />
              <span>Privilege registration confirmed. Dispatch frequency is strictly quarterly.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@domain.pk"
                className="w-full sm:w-72 px-4 py-3 rounded-full bg-[#14151C] border border-white/10 text-xs font-mono text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B]/60 transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] text-[#08080B] text-xs font-mono font-semibold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(198,161,91,0.25)] flex-shrink-0"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
