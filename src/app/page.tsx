import React from "react";
import { HeroTimeArchitecture } from "@/components/home/HeroTimeArchitecture";
import { CalibreAnatomy } from "@/components/home/CalibreAnatomy";
import { CuratedShowcase } from "@/components/home/CuratedShowcase";
import { LiveVaultAllocation } from "@/components/home/LiveVaultAllocation";
import { WhiteGloveDelivery } from "@/components/home/WhiteGloveDelivery";
import { PatronRegistry } from "@/components/home/PatronRegistry";
import { HorologyCircle } from "@/components/home/HorologyCircle";

export const revalidate = 120; // 2 minutes ISR

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-[#070709] selection:bg-[#C6A15B] selection:text-[#08080B]">
      {/* 1. Hero Time Architecture with 3D Orbital Canvas */}
      <HeroTimeArchitecture />

      {/* 2. Calibre Anatomy & Exploded Architecture */}
      <CalibreAnatomy />

      {/* 3. Curated Showcase (4 Showcase Masterpieces in PKR) */}
      <CuratedShowcase />

      {/* 4. Live Secured Vault Allocation & Settlement Card */}
      <LiveVaultAllocation />

      {/* 5. Discreet, Insured, White-Glove Hand Delivery Nationwide */}
      <WhiteGloveDelivery />

      {/* 6. Patron Registry Testimonials */}
      <PatronRegistry />

      {/* 7. Confidential Dispatch - Horology Circle */}
      <HorologyCircle />
    </div>
  );
}
