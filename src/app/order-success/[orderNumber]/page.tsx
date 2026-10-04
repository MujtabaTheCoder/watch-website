import React from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import { getWhatsAppOrderUrl } from "@/lib/format";

interface OrderSuccessPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = await params;

  const whatsappUrl = `https://wa.me/923001234567?text=${encodeURIComponent(
    `Salam VELLORE! I just placed order #${orderNumber}. Please confirm my dispatch.`
  )}`;

  return (
    <div className="min-h-screen bg-[#0B0B0F] py-20 px-6 flex items-center justify-center">
      <div className="max-w-2xl w-full rounded-3xl bg-[#14151B] border border-white/10 p-8 sm:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#C6A15B]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Checkmark Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-[#162016] border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shadow-[0_0_30px_rgba(37,211,102,0.2)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Titles */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-[#C6A15B]">
            Order Confirmed &bull; Priority Dispatch
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F1E8]">
            Thank You for Choosing VELLORE
          </h1>
          <p className="text-xs sm:text-sm text-[#F5F1E8]/70 max-w-lg mx-auto font-light leading-relaxed">
            Your horological order has been registered securely in our atelier queue.
          </p>
        </div>

        {/* Order Identifier Box */}
        <div className="p-6 rounded-2xl bg-[#0E0F13] border border-white/10 max-w-md mx-auto">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#F5F1E8]/40 block mb-1">
            Official Reference Number
          </span>
          <span className="font-mono text-2xl sm:text-3xl text-[#C6A15B] tracking-wider font-semibold">
            {orderNumber}
          </span>
          <p className="mt-2 text-xs text-[#F5F1E8]/50">
            Please quote this reference in all correspondence.
          </p>
        </div>

        {/* Dispatch Timeline Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto text-xs">
          <div className="p-4 rounded-xl bg-[#161720] border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-[#C6A15B]">
              <Truck className="w-4 h-4" />
              <span className="font-medium">Estimated Delivery</span>
            </div>
            <p className="text-[#F5F1E8]/70">
              2 to 4 business days via insured express courier across Pakistan.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161720] border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-[#C6A15B]">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-medium">Verification Protocol</span>
            </div>
            <p className="text-[#F5F1E8]/70">
              Our team will contact you via WhatsApp / SMS before courier handover.
            </p>
          </div>
        </div>

        {/* WhatsApp & Tracking Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href={`/track?order=${orderNumber}`}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] text-[#0B0B0F] font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg font-mono"
          >
            <Truck className="w-4 h-4" />
            <span>Track This Order</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-[#0B0B0F] font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg font-mono"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Confirm</span>
          </a>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-[#F5F1E8] font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors font-mono"
          >
            <span>Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
