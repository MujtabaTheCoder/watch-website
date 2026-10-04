import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#0B0B0F]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div className="absolute inset-0 rounded-full border-t-2 border-[#C6A15B] animate-spin" />
        <div className="absolute inset-4 rounded-full border border-[#C6A15B]/30 animate-pulse" />
      </div>
      <span className="mt-6 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C6A15B]">
        Calibrating VELLORE
      </span>
    </div>
  );
}
