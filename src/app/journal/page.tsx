import React from "react";
import type { Metadata } from "next";
import { JournalView } from "@/components/journal/JournalView";

export const metadata: Metadata = {
  title: "Horological Journal & Style Guides | VELLORE",
  description:
    "Explore watch sizing guides, mechanical vs quartz comparisons, and formal styling advice for luxury timepieces across Pakistan.",
};

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <JournalView />
      </div>
    </div>
  );
}
