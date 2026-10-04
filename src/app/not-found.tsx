import React from "react";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-[#0B0B0F]">
      <div className="max-w-md w-full rounded-3xl bg-[#14151B] border border-white/10 p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-[#16161D] border border-white/10 text-[#C6A15B] mx-auto flex items-center justify-center">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C6A15B]">
            404 &bull; Coordinate Deviation
          </span>
          <h1 className="font-serif text-3xl text-[#F5F1E8]">Timepiece Not Found</h1>
          <p className="text-xs text-[#F5F1E8]/50 leading-relaxed font-light">
            The page or model you are seeking has either moved to our archives or does not exist.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#C6A15B] text-[#0B0B0F] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#dfc299] transition-colors"
          >
            <span>Browse Master Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
