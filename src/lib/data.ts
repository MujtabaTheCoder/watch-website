import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { Product, StoreSettings } from "@/types";
import { DEFAULT_PRODUCTS } from "./default-products";

// Server-side public Supabase reader
function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycwxjqwktazjttmjglla.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_guRi1Uo2lCJPfAAFPEJ_Sw_kel-CFVX";
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

import {
  getUnifiedProducts,
  getUnifiedFeaturedProducts,
  getUnifiedProductBySlug,
} from "./products-store";

// Cached fetch for all products
export const getCachedProducts = unstable_cache(
  async (category?: string): Promise<Product[]> => {
    return await getUnifiedProducts(category);
  },
  ["products-list"],
  {
    revalidate: 60, // 1 minute ISR
    tags: ["products"],
  }
);

// Cached fetch for featured products
export const getFeaturedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    return await getUnifiedFeaturedProducts();
  },
  ["featured-products"],
  {
    revalidate: 60,
    tags: ["products"],
  }
);

// Cached fetch for single product by slug
export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    return await getUnifiedProductBySlug(slug);
  },
  ["product-detail"],
  {
    revalidate: 60,
    tags: ["products"],
  }
);

// Cached fetch for store settings
export const getStoreSettings = unstable_cache(
  async (): Promise<StoreSettings> => {
    const defaultSettings: StoreSettings = {
      store_name: "VELLORE",
      tagline: "Time, Refined.",
      whatsapp_number: "+923001234567",
      standard_delivery_fee: 250,
      free_delivery_threshold: 15000,
      support_email: "concierge@vellore.pk",
      support_phone: "+923001234567",
    };

    try {
      const supabase = getPublicClient();
      const { data, error } = await supabase.from("settings").select("key, value");

      if (error || !data || data.length === 0) {
        return defaultSettings;
      }

      const map: Record<string, string> = {};
      data.forEach((row) => {
        map[row.key] = row.value;
      });

      return {
        store_name: map.store_name || defaultSettings.store_name,
        tagline: map.tagline || defaultSettings.tagline,
        whatsapp_number: map.whatsapp_number || defaultSettings.whatsapp_number,
        standard_delivery_fee: map.standard_delivery_fee
          ? Number(map.standard_delivery_fee)
          : defaultSettings.standard_delivery_fee,
        free_delivery_threshold: map.free_delivery_threshold
          ? Number(map.free_delivery_threshold)
          : defaultSettings.free_delivery_threshold,
        support_email: map.support_email || defaultSettings.support_email,
        support_phone: map.support_phone || defaultSettings.support_phone,
      };
    } catch {
      return defaultSettings;
    }
  },
  ["store-settings"],
  {
    revalidate: 300,
    tags: ["settings"],
  }
);
