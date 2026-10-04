import React from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getCachedProducts } from "@/lib/data";
import { ProductInteractiveView } from "@/components/shop/ProductInteractiveView";
import { ProductCard } from "@/components/shop/ProductCard";
import { DEFAULT_PRODUCTS } from "@/lib/default-products";
import type { Metadata } from "next";

export const revalidate = 120; // 2 minutes ISR

export async function generateStaticParams() {
  return DEFAULT_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Watch Not Found | VELLORE",
    };
  }

  return {
    title: `${product.name} | VELLORE`,
    description: product.description,
    openGraph: {
      title: `${product.name} — VELLORE`,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Related products from same category or general catalog
  const allProducts = await getCachedProducts();
  const related = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.featured))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0B0B0F] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Product Presentation */}
        <ProductInteractiveView product={product} />

        {/* Related Timepieces */}
        {related.length > 0 && (
          <div className="mt-28 pt-16 border-t border-white/10">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[11px] uppercase tracking-[0.28em] text-[#C6A15B] font-mono">
                Coordinated Designs
              </span>
              <h3 className="mt-2 text-2xl sm:text-3xl font-serif text-[#F5F1E8]">
                Complementary Timepieces
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
