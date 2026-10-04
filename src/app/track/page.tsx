import React, { Suspense } from "react";
import type { Metadata } from "next";
import { OrderTrackingView } from "@/components/tracking/OrderTrackingView";

export const metadata: Metadata = {
  title: "Track Your Order | VELLORE",
  description:
    "Track your VELLORE luxury watch order in real-time across Pakistan. View QC verification, courier dispatch, and estimated delivery dates.",
};

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-24 text-center text-[#F5F1E8]/50 font-mono text-xs">
              Loading tracking system...
            </div>
          }
        >
          <OrderTrackingView />
        </Suspense>
      </div>
    </div>
  );
}
