"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("VELLORE Application Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-[#0B0B0F]">
      <div className="max-w-md w-full rounded-3xl bg-[#14151B] border border-white/10 p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C6A15B]">
            Horological Interruption
          </span>
          <h1 className="font-serif text-2xl text-[#F5F1E8]">An Unexpected Error Occurred</h1>
          <p className="text-xs text-[#F5F1E8]/50 leading-relaxed font-light">
            We apologize for the brief pause. Our systems log all interruptions for immediate resolution.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#C6A15B] text-[#0B0B0F] font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 hover:bg-[#dfc299] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-white/10 text-[#F5F1E8] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
