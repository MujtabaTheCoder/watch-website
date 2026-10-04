import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Calendar, ArrowRight, Share2, Tag, ShieldCheck } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogs-data";
import { DEFAULT_PRODUCTS } from "@/lib/default-products";
import { formatPKR } from "@/lib/format";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return { title: "Article Not Found | VELLORE" };
  }

  return {
    title: `${post.title} | VELLORE Journal`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | VELLORE Journal`,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedProduct = post.content.relatedProductSlug
    ? DEFAULT_PRODUCTS.find((p) => p.slug === post.content.relatedProductSlug)
    : null;

  return (
    <article className="min-h-screen bg-[#0B0B0F] py-12 sm:py-16 text-[#F5F1E8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Navigation & Back Link */}
        <div className="flex items-center justify-between text-xs font-mono">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-[#F5F1E8]/70 hover:text-[#C6A15B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </Link>
          <span className="text-[11px] uppercase tracking-wider text-[#C6A15B]">
            {post.category}
          </span>
        </div>

        {/* Article Header */}
        <header className="space-y-5">
          <h1 className="text-3xl sm:text-5xl font-serif text-[#F5F1E8] tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#F5F1E8]/60 pt-2 border-b border-white/10 pb-6">
            <span className="text-[#C6A15B] font-medium">By {post.author.name}</span>
            <span>&bull;</span>
            <span>{post.author.role}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedAt}
            </span>
          </div>
        </header>

        {/* Main Cover Image */}
        <div className="relative h-[340px] sm:h-[460px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
          />
        </div>

        {/* Lead Excerpt Blockquote */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#14151B] border-l-2 border-[#C6A15B] text-base sm:text-lg text-[#F5F1E8]/90 font-serif italic leading-relaxed">
          &ldquo;{post.content.lead}&rdquo;
        </div>

        {/* Article Body Sections */}
        <div className="space-y-8 text-sm sm:text-base text-[#F5F1E8]/75 font-light leading-relaxed">
          {post.content.sections.map((sec, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="font-serif text-2xl text-[#F5F1E8] font-medium pt-2">
                {sec.heading}
              </h2>
              {sec.body.map((para, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Related Timepiece Showcase Box */}
        {relatedProduct && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E0F14] border border-[#C6A15B]/30 shadow-xl space-y-4 mt-12">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C6A15B] block font-semibold">
              FEATURED IN THIS ESSAY
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#1A1A22] border border-white/10 flex-shrink-0">
                  <Image
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#F5F1E8]">{relatedProduct.name}</h3>
                  <span className="font-mono text-sm font-semibold text-[#C6A15B] block mt-0.5">
                    {formatPKR(relatedProduct.discount_price ?? relatedProduct.price)}
                  </span>
                  <span className="text-xs text-[#F5F1E8]/60 font-light block">
                    Free insured delivery across Pakistan
                  </span>
                </div>
              </div>

              <Link
                href={`/watches/${relatedProduct.slug}`}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] text-[#08080B] text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md flex-shrink-0"
              >
                <span>Acquire Timepiece</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Post Footer & Share */}
        <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <Link
            href="/journal"
            className="text-[#C6A15B] hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Horological Journal</span>
          </Link>

          <Link
            href="/shop"
            className="px-6 py-2.5 rounded-full border border-white/15 bg-white/5 hover:border-[#C6A15B] text-[#F5F1E8] hover:text-[#C6A15B] transition-colors"
          >
            Explore Master Collection
          </Link>
        </footer>

      </div>
    </article>
  );
}
