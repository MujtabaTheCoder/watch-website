"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Sparkles, Tag, ShoppingBag } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { DEFAULT_PRODUCTS } from "@/lib/default-products";
import { formatPKR } from "@/lib/format";

export function LiveSearchModal() {
  const router = useRouter();
  const { isOpen, closeSearch, searchQuery, setSearchQuery } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open & listen for keyboard shortcuts
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useSearchStore.getState().toggleSearch();
      }
      if (e.key === "Escape" && useSearchStore.getState().isOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSearch]);

  const [allProducts, setAllProducts] = useState(DEFAULT_PRODUCTS);

  // Fetch updated catalog on mount or when search opens
  useEffect(() => {
    if (isOpen) {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.products) && data.products.length > 0) {
            setAllProducts(data.products);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Filter products in real-time
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return allProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.description || "").toLowerCase().includes(q) ||
        product.specs?.movement?.toLowerCase().includes(q) ||
        product.specs?.strap?.toLowerCase().includes(q)
      );
    }).slice(0, 6);
  }, [searchQuery, allProducts]);

  const quickCategories = [
    { label: "Classic", desc: "Timeless dials & leather straps" },
    { label: "Minimal", desc: "Clean dials, ultra-slim" },
    { label: "Sport", desc: "Chronographs & steel bracelets" },
    { label: "Luxe", desc: "Rose-gold & special occasions" },
    { label: "Gifting", desc: "His-and-hers gift sets" },
  ];

  const handleSelectProduct = (slug: string) => {
    closeSearch();
    router.push(`/watches/${slug}`);
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      closeSearch();
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0E0F14] border border-[#C6A15B]/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form
          onSubmit={handleSubmitSearch}
          className="relative flex items-center border-b border-white/10 px-5 py-4 bg-[#14151B]"
        >
          <Search className="w-5 h-5 text-[#C6A15B] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timepieces by model, collection, strap..."
            className="w-full bg-transparent border-none px-4 text-sm sm:text-base font-sans text-[#F5F1E8] placeholder:text-[#F5F1E8]/35 focus:outline-none focus:ring-0"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full text-[#F5F1E8]/40 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={closeSearch}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#F5F1E8]/60 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Results / Suggestions Container */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {searchQuery.trim() ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[11px] font-mono text-[#F5F1E8]/50">
                <span>
                  {searchResults.length} {searchResults.length === 1 ? "RESULT" : "RESULTS"} FOUND
                </span>
                <Link
                  href={`/shop?q=${encodeURIComponent(searchQuery)}`}
                  onClick={closeSearch}
                  className="text-[#C6A15B] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View All in Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {searchResults.length > 0 ? (
                <div className="divide-y divide-white/5 pt-2">
                  {searchResults.map((product) => {
                    const price = product.discount_price ?? product.price;
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product.slug)}
                        className="py-3 px-3 -mx-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#1A1A22] border border-white/10 flex-shrink-0">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="56px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#C6A15B]">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#C6A15B] block">
                              {product.category} Collection
                            </span>
                            <h4 className="font-serif text-sm sm:text-base text-[#F5F1E8] group-hover:text-[#C6A15B] transition-colors truncate">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-[#F5F1E8]/60 font-light truncate max-w-sm">
                              {product.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="font-mono text-xs sm:text-sm font-semibold text-[#F5F1E8] block">
                            {formatPKR(price)}
                          </span>
                          {product.discount_price && (
                            <span className="font-mono text-[10px] line-through text-[#F5F1E8]/40 block">
                              {formatPKR(product.price)}
                            </span>
                          )}
                          <span className="text-[9px] font-mono text-emerald-400 block">
                            In Stock
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-[#F5F1E8]/20 mx-auto" />
                  <p className="text-sm font-serif text-[#F5F1E8]">
                    No timepieces matching &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-xs text-[#F5F1E8]/50 max-w-xs mx-auto">
                    Try searching for Classic, Minimal, Sport, Chrono, or Gold.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Empty State: Quick Collections & Popular Suggestions */
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C6A15B] block font-semibold mb-3">
                  EXPLORE POPULAR COLLECTIONS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {quickCategories.map((cat) => (
                    <Link
                      key={cat.label}
                      href={`/shop?category=${cat.label}`}
                      onClick={closeSearch}
                      className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-[#C6A15B]/40 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <h5 className="font-serif text-sm text-[#F5F1E8] group-hover:text-[#C6A15B] transition-colors">
                          {cat.label}
                        </h5>
                        <p className="text-[10px] font-mono text-[#F5F1E8]/50">
                          {cat.desc}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#F5F1E8]/40 group-hover:text-[#C6A15B] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bestseller Highlights in Search Modal */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C6A15B] block font-semibold mb-3">
                  POPULAR SEARCHES
                </span>
                <div className="flex flex-wrap gap-2">
                  {["Aurelian Classic", "Noir Meridian", "Vanta Chrono", "Rose Gold", "Leather Strap", "Water Resistant"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1 rounded-full bg-[#161720] hover:bg-[#C6A15B]/20 border border-white/10 text-xs font-mono text-[#F5F1E8]/75 hover:text-[#C6A15B] transition-colors flex items-center gap-1.5"
                      >
                        <Tag className="w-3 h-3 text-[#C6A15B]" />
                        <span>{term}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-5 py-3 border-t border-white/5 bg-[#0A0A0D] flex items-center justify-between text-[10px] font-mono text-[#F5F1E8]/40">
          <span>Press ESC to close</span>
          <span>Free delivery all over Pakistan</span>
        </div>
      </div>
    </div>
  );
}
