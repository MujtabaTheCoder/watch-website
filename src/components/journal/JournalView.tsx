"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, BookOpen, Clock, Calendar, ArrowRight, Tag } from "lucide-react";
import { BLOG_POSTS, BlogPost } from "@/lib/blogs-data";

export function JournalView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Horology Guide",
    "Style & Etiquette",
    "Care & Maintenance",
    "Materials & Craft",
    "Gifting",
  ];

  // Filter in real-time
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.author.name.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-[#C6A15B] font-semibold">
          VELLORE CHRONICLES &amp; JOURNAL
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif text-[#F5F1E8] tracking-tight">
          Horological Journal
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-light max-w-lg mx-auto leading-relaxed">
          Essays, care guides, and styling recommendations curated by master horologists for Pakistan&apos;s watch connoisseurs.
        </p>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#14151B] border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Interactive Search Input Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#C6A15B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, guides, styling..."
              className="w-full bg-[#0E0F13] border border-white/10 rounded-full pl-10 pr-9 py-2.5 text-xs text-[#F5F1E8] placeholder:text-[#F5F1E8]/40 focus:outline-none focus:border-[#C6A15B] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F1E8]/40 hover:text-white"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Result Counter & Active Query Badge */}
          <div className="text-xs font-mono text-[#F5F1E8]/60 flex items-center gap-2">
            <span>Showing {filteredPosts.length} of {BLOG_POSTS.length} articles</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-[#C6A15B]/15 text-[#C6A15B] text-[10px]">
                Matching &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-colors ${
                  isSelected
                    ? "bg-[#C6A15B] text-[#08080B] font-semibold shadow-md"
                    : "bg-[#0E0F13] text-[#F5F1E8]/70 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#0E0F14] border border-white/5 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-[#F5F1E8]/20 mx-auto" />
          <h3 className="font-serif text-xl text-[#F5F1E8]">No articles found</h3>
          <p className="text-xs text-[#F5F1E8]/50 max-w-sm mx-auto">
            No articles match &ldquo;{searchQuery}&rdquo;. Try searching for &ldquo;dial&rdquo;, &ldquo;leather&rdquo;, &ldquo;automatic&rdquo;, or &ldquo;sapphire&rdquo;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="px-5 py-2 rounded-full bg-[#1A1A22] border border-white/10 hover:border-[#C6A15B] text-xs font-mono text-[#C6A15B] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Blog Articles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl bg-[#0E0F14] border border-white/[0.08] hover:border-[#C6A15B]/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl group"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative h-52 w-full overflow-hidden bg-[#161720]">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0F14] via-transparent to-transparent opacity-80" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#08080B]/85 backdrop-blur-md border border-[#C6A15B]/30 text-[10px] font-mono uppercase tracking-wider text-[#C6A15B]">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-[#F5F1E8]/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.publishedAt}
                    </span>
                  </div>

                  <h2 className="font-serif text-xl sm:text-2xl text-[#F5F1E8] group-hover:text-[#C6A15B] transition-colors leading-snug">
                    <Link href={`/journal/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Footer with Author & Link */}
              <div className="px-6 pb-6 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-[#F5F1E8]/60">
                  By {post.author.name}
                </span>

                <Link
                  href={`/journal/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#C6A15B] group-hover:translate-x-1 transition-transform"
                >
                  <span>Read Essay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
