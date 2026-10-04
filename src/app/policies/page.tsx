import React from "react";
import { Truck, RotateCcw, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import { getWhatsAppConciergeUrl } from "@/lib/format";

export const metadata = {
  title: "Delivery & Return Policies | VELLORE",
  description: "Transparent Cash on Delivery, open-box inspection, and 7-day exchange policies for VELLORE timepieces across Pakistan.",
};

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] py-16">
      <div className="max-w-4xl mx-auto px-6 space-y-14">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-[#C6A15B]">
            Client Assurances
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-serif text-[#F5F1E8]">
            Shipping &amp; Return Protocols
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#F5F1E8]/60 font-light">
            Clear, transparent policies crafted to give you total peace of mind when acquiring luxury timepieces in Pakistan.
          </p>
        </div>

        {/* Policy Grid */}
        <div className="space-y-8 text-sm text-[#F5F1E8]/70 font-light leading-relaxed">
          {/* Shipping */}
          <div className="p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-[#C6A15B]">
              <Truck className="w-5 h-5" />
              <h2 className="font-serif text-xl text-[#F5F1E8]">Shipping &amp; Delivery</h2>
            </div>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <strong className="text-[#F5F1E8]">Delivery Timeline:</strong> Delivery in 2-5 working days across Pakistan.
              </li>
              <li>
                <strong className="text-[#F5F1E8]">Cash on Delivery (COD):</strong> Available in major cities and nationwide across Pakistan.
              </li>
              <li>
                <strong className="text-[#F5F1E8]">Free Shipping:</strong> Free shipping on all orders above PKR 15,000.
              </li>
              <li>
                <strong className="text-[#F5F1E8]">Order Tracking:</strong> We'll send you an active tracking update by SMS or WhatsApp once your parcel ships.
              </li>
            </ul>
          </div>

          {/* Returns & Exchanges */}
          <div className="p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-[#C6A15B]">
              <RotateCcw className="w-5 h-5" />
              <h2 className="font-serif text-xl text-[#F5F1E8]">7-Day Easy Returns &amp; Exchanges</h2>
            </div>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <strong className="text-[#F5F1E8]">7-Day Return Window:</strong> Returns accepted within 7 days if the watch is unused and in original packaging.
              </li>
              <li>
                <strong className="text-[#F5F1E8]">Condition Requirement:</strong> The watch must be in pristine condition, with all tags and original box contents intact.
              </li>
              <li>
                <strong className="text-[#F5F1E8]">Support:</strong> Message our customer support team anytime via WhatsApp and a real person replies promptly.
              </li>
            </ul>
          </div>

          {/* Warranty */}
          <div className="p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-[#C6A15B]">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="font-serif text-xl text-[#F5F1E8]">Official 2-Year International Warranty</h2>
            </div>
            <p>
              Each VELLORE timepiece is safeguarded by an official two-year warranty certificate. This covers:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Internal calibre movement failure, timing inaccuracies beyond normal tolerances, and battery replacement within the first 12 months.</li>
              <li>Manufacturing defects on the dial, hands, or crown assembly.</li>
              <li>Water ingress occurring under rated depth specifications (5 ATM / 10 ATM / 20 ATM).</li>
            </ul>
          </div>
        </div>

        {/* Assistance Box */}
        <div className="p-6 rounded-2xl bg-[#0E0F13] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-[#C6A15B]" />
            <span className="text-xs text-[#F5F1E8]">
              Have questions regarding an active delivery or claim?
            </span>
          </div>

          <a
            href={getWhatsAppConciergeUrl("Policy & Delivery Inquiry")}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full bg-[#25D366] text-[#0B0B0F] text-xs font-mono font-medium tracking-wider hover:bg-[#20ba5a] transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
