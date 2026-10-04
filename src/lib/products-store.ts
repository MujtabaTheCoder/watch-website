import fs from "fs";
import path from "path";
import { Product, WatchSpecs } from "@/types";
import { DEFAULT_PRODUCTS } from "./default-products";

// Server-side runtime singleton cache
declare global {
  // eslint-disable-next-line no-var
  var __VELLORE_PRODUCTS_CACHE__: Product[] | undefined;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

/**
 * Ensure the persistent file exists with initial data
 */
function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(
        PRODUCTS_FILE,
        JSON.stringify(DEFAULT_PRODUCTS, null, 2),
        "utf-8"
      );
    }
  } catch (err) {
    console.warn("Could not ensure products.json file:", err);
  }
}

/**
 * Load products from disk or default seed
 */
function readProductsFromDisk(): Product[] {
  try {
    ensureDataFile();
    if (fs.existsSync(PRODUCTS_FILE)) {
      const content = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Product[];
      }
    }
  } catch (err) {
    console.warn("Failed reading products.json, using defaults:", err);
  }
  return DEFAULT_PRODUCTS;
}

/**
 * Write products to disk
 */
function writeProductsToDisk(products: Product[]): void {
  try {
    ensureDataFile();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed writing products.json to disk:", err);
  }
}

/**
 * Get the current product list (memory + file synced)
 */
export async function getUnifiedProducts(category?: string): Promise<Product[]> {
  if (!globalThis.__VELLORE_PRODUCTS_CACHE__ || globalThis.__VELLORE_PRODUCTS_CACHE__.length === 0) {
    globalThis.__VELLORE_PRODUCTS_CACHE__ = readProductsFromDisk();
  }

  const all = globalThis.__VELLORE_PRODUCTS_CACHE__;

  if (category && category !== "All") {
    const cleanCat = category.toLowerCase().trim();
    return all.filter((p) => (p.category || "").toLowerCase().trim() === cleanCat);
  }

  return all;
}

/**
 * Get a single product by slug or id
 */
export async function getUnifiedProductBySlug(slug: string): Promise<Product | null> {
  const products = await getUnifiedProducts();
  const cleanSlug = slug.toLowerCase().trim();

  const found = products.find(
    (p) => (p.slug || "").toLowerCase().trim() === cleanSlug || p.id === slug
  );

  return found || null;
}

/**
 * Get featured products
 */
export async function getUnifiedFeaturedProducts(): Promise<Product[]> {
  const products = await getUnifiedProducts();
  const featured = products.filter((p) => p.featured);
  if (featured.length > 0) return featured.slice(0, 6);
  return products.slice(0, 6);
}

/**
 * Save (insert or update) a product
 */
export async function saveUnifiedProduct(productData: {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number | null;
  category: string;
  images: string[];
  stock: number;
  featured: boolean;
  specs?: Record<string, string>;
  model_config?: {
    case_color: string;
    dial_color: string;
    strap_color: string;
    accents: string;
  };
}): Promise<Product> {
  const currentList = await getUnifiedProducts();
  const now = new Date().toISOString();

  let savedProduct: Product;

  const defaultSpecs: WatchSpecs = {
    case_size: "41mm",
    movement: "Precision Japanese Quartz",
    strap: "Genuine Italian Leather",
    water_resistance: "5 ATM",
    glass: "Scratch-Resistant Sapphire Crystal",
    warranty: "1-Year Official Warranty",
  };

  const finalSpecs: WatchSpecs = {
    ...defaultSpecs,
    ...(productData.specs || {}),
    case_size: productData.specs?.case_size || defaultSpecs.case_size,
    movement: productData.specs?.movement || defaultSpecs.movement,
    strap: productData.specs?.strap || defaultSpecs.strap,
    water_resistance: productData.specs?.water_resistance || defaultSpecs.water_resistance,
    glass: productData.specs?.glass || defaultSpecs.glass,
    warranty: productData.specs?.warranty || defaultSpecs.warranty,
  };

  if (productData.id && currentList.some((p) => p.id === productData.id)) {
    // Update existing
    savedProduct = {
      id: productData.id,
      name: productData.name.trim(),
      slug: productData.slug.trim().toLowerCase(),
      description: productData.description.trim(),
      price: Number(productData.price),
      discount_price: productData.discount_price ? Number(productData.discount_price) : null,
      category: productData.category.trim(),
      images:
        productData.images && productData.images.length > 0
          ? productData.images
          : ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"],
      stock: Number(productData.stock) || 0,
      featured: Boolean(productData.featured),
      specs: finalSpecs,
      model_config: productData.model_config || {
        case_color: "#C6A15B",
        dial_color: "#0B0B0F",
        strap_color: "#2C1810",
        accents: "#C6A15B",
      },
      created_at: currentList.find((p) => p.id === productData.id)?.created_at || now,
      updated_at: now,
    };

    const updatedList = currentList.map((p) => (p.id === productData.id ? savedProduct : p));
    globalThis.__VELLORE_PRODUCTS_CACHE__ = updatedList;
    writeProductsToDisk(updatedList);
  } else {
    // Create new
    const newId = productData.id || "prod-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    savedProduct = {
      id: newId,
      name: productData.name.trim(),
      slug: (productData.slug || productData.name).trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-"),
      description: productData.description.trim(),
      price: Number(productData.price),
      discount_price: productData.discount_price ? Number(productData.discount_price) : null,
      category: productData.category.trim(),
      images:
        productData.images && productData.images.length > 0
          ? productData.images
          : ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"],
      stock: Number(productData.stock) || 0,
      featured: Boolean(productData.featured),
      specs: finalSpecs,
      model_config: productData.model_config || {
        case_color: "#C6A15B",
        dial_color: "#0B0B0F",
        strap_color: "#2C1810",
        accents: "#C6A15B",
      },
      created_at: now,
      updated_at: now,
    };

    const updatedList = [savedProduct, ...currentList];
    globalThis.__VELLORE_PRODUCTS_CACHE__ = updatedList;
    writeProductsToDisk(updatedList);
  }

  return savedProduct;
}

/**
 * Delete a product by id or slug
 */
export async function deleteUnifiedProduct(idOrSlug: string): Promise<boolean> {
  const currentList = await getUnifiedProducts();
  const filtered = currentList.filter(
    (p) => p.id !== idOrSlug && p.slug !== idOrSlug
  );

  globalThis.__VELLORE_PRODUCTS_CACHE__ = filtered;
  writeProductsToDisk(filtered);
  return true;
}
