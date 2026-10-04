"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Shield, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useSearchStore } from "@/store/useSearchStore";
import { getWhatsAppConciergeUrl } from "@/lib/format";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleCart, getTotalItems } = useCartStore();
  const { openSearch } = useSearchStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "COLLECTIONS", href: "/shop" },
    { label: "BEST SELLERS", href: "/shop?category=Luxe" },
    { label: "ABOUT US", href: "/about" },
    { label: "BLOGS", href: "/journal" },
    { label: "TRACK ORDER", href: "/track" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-[#08080B]/95 border-b border-[#C6A15B]/20 shadow-xl py-3"
          : "bg-[#08080B]/80 py-4 sm:py-5 border-b border-white/[0.04]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#F5F1E8]/80 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#C6A15B]" />}
          </button>
        </div>

        {/* Brand Wordmark (VELLORE) */}
        <Link
          href="/"
          className="flex flex-col items-center group text-center min-w-0 px-1"
        >
          <span className="font-serif text-lg sm:text-2xl tracking-[0.22em] sm:tracking-[0.28em] text-[#F5F1E8] group-hover:text-[#C6A15B] transition-colors duration-300 font-semibold uppercase truncate">
            VELLORE
          </span>
          <span className="text-[7px] sm:text-[8.5px] tracking-[0.26em] sm:tracking-[0.34em] uppercase text-[#C6A15B] font-light -mt-0.5 opacity-90 truncate">
            TIME, WORN BEAUTIFULLY
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[10.5px] tracking-[0.2em] font-medium uppercase transition-colors duration-200 relative py-1 flex items-center gap-1.5 ${
                  isActive ? "text-[#C6A15B]" : "text-[#F5F1E8]/75 hover:text-[#C6A15B]"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C6A15B] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Search, Cart Button, Admin Link */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
          {/* Live Search Trigger Button */}
          <button
            type="button"
            onClick={() => openSearch()}
            className="p-1.5 sm:p-2 text-[#F5F1E8]/70 hover:text-[#C6A15B] transition-colors flex items-center gap-1.5"
            title="Search Collections (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden xl:inline text-[9px] font-mono text-[#F5F1E8]/40 border border-white/10 rounded px-1.5 py-0.5">
              ⌘K
            </span>
          </button>

          {/* Cart Button: Touch-friendly and perfectly sized on mobile */}
          <button
            onClick={toggleCart}
            className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-[#C6A15B]/40 bg-[#121319]/90 hover:bg-[#C6A15B]/15 hover:border-[#C6A15B] text-[#C6A15B] transition-all duration-300 font-mono text-[10px] sm:text-[11px] tracking-wider shadow-[0_0_15px_rgba(198,161,91,0.15)] flex-shrink-0"
            aria-label={`Open shopping cart with ${totalItems} items`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span className="hidden xs:inline sm:inline font-semibold">CART</span>
            <span className="text-[10px] text-[#F5F1E8] font-bold">
              [{totalItems}]
            </span>
          </button>

          {/* Profile / Admin link */}
          <Link
            href="/admin"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 bg-white/5 hover:border-[#C6A15B]/60 flex items-center justify-center text-[#F5F1E8]/80 hover:text-[#C6A15B] transition-colors flex-shrink-0"
            title="Admin Portal"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0A0E] border-b border-[#C6A15B]/20 px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs tracking-[0.24em] uppercase text-[#F5F1E8]/80 hover:text-[#C6A15B] py-2 flex items-center justify-between"
              >
                <span>{link.label}</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <a
                href={getWhatsAppConciergeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-full bg-[#C6A15B] text-[#08080A] text-xs font-semibold tracking-wider uppercase font-mono"
              >
                WhatsApp Support
              </a>
              <Link
                href="/admin"
                className="w-full text-center py-2.5 rounded-full border border-white/20 text-[#F5F1E8] text-xs font-medium tracking-wider uppercase font-mono"
              >
                Owner Portal (/admin)
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
