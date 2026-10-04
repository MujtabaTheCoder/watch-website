import React from "react";
import Link from "next/link";
import { getCachedProducts } from "@/lib/data";
import { ProductCard } from "@/components/shop/ProductCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

export const revalidate = 120; // 2 minutes ISR

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.category || "All";
  const currentSort = resolvedParams.sort || "featured";
  const searchQuery = resolvedParams.q || "";

  const allProducts = await getCachedProducts();

  const collectionDescriptions: Record<string, string> = {
    Classic: "Timeless dials, slim cases, leather straps.",
    Sport: "Built for movement, with bold faces and durable straps.",
    Minimal: "Clean dials, nothing extra.",
    Luxe: "Statement pieces for special occasions.",
    Gifting: "Watches for him and for her.",
  };

  // Filter by category
  let filtered = allProducts;
  if (currentCategory && currentCategory !== "All") {
    const cur = currentCategory.toLowerCase();
    filtered = filtered.filter((p) => {
      const pCat = p.category.toLowerCase();
      if (pCat === cur) return true;
      if ((cur === "sport" || cur === "sports") && (pCat === "sport" || pCat === "sports")) return true;
      if ((cur === "minimal" || cur === "minimalist") && (pCat === "minimal" || pCat === "minimalist")) return true;
      if ((cur === "luxe" || cur === "luxury") && (pCat === "luxe" || pCat === "luxury")) return true;
      return false;
    });
  }

  // Filter by search query
  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Sort
  if (currentSort === "price-low") {
    filtered = [...filtered].sort((a, b) => {
      const pA = a.discount_price ?? a.price;
      const pB = b.discount_price ?? b.price;
      return pA - pB;
    });
  } else if (currentSort === "price-high") {
    filtered = [...filtered].sort((a, b) => {
      const pA = a.discount_price ?? a.price;
      const pB = b.discount_price ?? b.price;
      return pB - pA;
    });
  } else if (currentSort === "newest") {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  const categories = ["All", "Classic", "Sport", "Minimal", "Luxe", "Gifting"];

  return (
    <div className="min-h-screen bg-[#0B0B0F] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#C6A15B] font-mono">
            PREMIUM WATCH COLLECTION
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-serif text-[#F5F1E8]">
            The Master Collection
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#F5F1E8]/70 font-light">
            {collectionDescriptions[currentCategory] ||
              "Premium quality watches with free delivery all over Pakistan."}
          </p>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#14151B] border border-white/5">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => {
              const isSelected = currentCategory.toLowerCase() === cat.toLowerCase();
              return (
                <Link
                  key={cat}
                  href={`/shop?category=${cat}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}&sort=${currentSort}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-colors ${
                    isSelected
                      ? "bg-[#C6A15B] text-[#0B0B0F] font-medium shadow-md"
                      : "bg-[#0E0F13] text-[#F5F1E8]/70 hover:text-white border border-white/5"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {/* Search Input & Sort Options */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <form action="/shop" method="GET" className="relative flex-1 md:w-64">
              <input
                type="hidden"
                name="category"
                value={currentCategory}
              />
              <input
                type="hidden"
                name="sort"
                value={currentSort}
              />
              <Search className="w-3.5 h-3.5 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search models & collections..."
                className="w-full bg-[#0E0F13] border border-white/10 rounded-full pl-8 pr-8 py-2 text-xs text-[#F5F1E8] placeholder:text-[#F5F1E8]/35 focus:outline-none focus:border-[#C6A15B]"
              />
              {searchQuery && (
                <Link
                  href={`/shop?category=${currentCategory}&sort=${currentSort}`}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F1E8]/40 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </Link>
              )}
            </form>

            {/* Sort Links */}
            <div className="flex items-center gap-1 bg-[#0E0F13] border border-white/10 rounded-full p-1 text-[11px] font-mono">
              <Link
                href={`/shop?category=${currentCategory}&sort=featured${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-2.5 py-1 rounded-full ${
                  currentSort === "featured" ? "bg-[#1E2028] text-[#C6A15B]" : "text-[#F5F1E8]/60 hover:text-white"
                }`}
              >
                Featured
              </Link>
              <Link
                href={`/shop?category=${currentCategory}&sort=price-low${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-2.5 py-1 rounded-full ${
                  currentSort === "price-low" ? "bg-[#1E2028] text-[#C6A15B]" : "text-[#F5F1E8]/60 hover:text-white"
                }`}
              >
                Price &uarr;
              </Link>
              <Link
                href={`/shop?category=${currentCategory}&sort=price-high${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-2.5 py-1 rounded-full ${
                  currentSort === "price-high" ? "bg-[#1E2028] text-[#C6A15B]" : "text-[#F5F1E8]/60 hover:text-white"
                }`}
              >
                Price &darr;
              </Link>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between text-xs text-[#F5F1E8]/50 font-mono">
          <span>Showing {filtered.length} Timepiece{filtered.length === 1 ? "" : "s"}</span>
          {searchQuery && (
            <span>
              Searching for &ldquo;{searchQuery}&rdquo; &bull;{" "}
              <Link href={`/shop?category=${currentCategory}`} className="text-[#C6A15B] hover:underline">
                Clear search
              </Link>
            </span>
          )}
        </div>

        {/* Product Cards Grid */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center rounded-3xl border border-white/5 bg-[#14151B]">
            <p className="font-serif text-xl text-[#F5F1E8]">No timepieces match your criteria.</p>
            <p className="mt-2 text-xs text-[#F5F1E8]/50">
              Try adjusting your category filters or search keywords.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block px-6 py-2.5 rounded-full bg-[#C6A15B] text-[#0B0B0F] text-xs uppercase tracking-widest font-medium"
            >
              Reset All Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
