import fs from "fs";
import path from "path";
import { Order, OrderStatus } from "@/types";
import { createClient } from "@supabase/supabase-js";

// Global cache across server runtime - Clean slate (0 demo orders)
declare global {
  // eslint-disable-next-line no-var
  var __VELLORE_LOCAL_ORDERS__: Order[] | undefined;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureOrdersFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not ensure orders.json:", err);
  }
}

function readOrdersFromDisk(): Order[] {
  try {
    ensureOrdersFile();
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed as Order[];
      }
    }
  } catch (err) {
    console.warn("Failed reading orders.json:", err);
  }
  return [];
}

function writeOrdersToDisk(orders: Order[]): void {
  try {
    ensureOrdersFile();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed writing orders.json:", err);
  }
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycwxjqwktazjttmjglla.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_guRi1Uo2lCJPfAAFPEJ_Sw_kel-CFVX";
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Filter out mock / template test orders (e.g. MSV- prefix, USD currency, or legacy template UUIDs)
 */
function isDemoOrder(o: { id?: string; order_number?: string; currency?: string }): boolean {
  const num = (o.order_number || "").toUpperCase();
  const cur = (o.currency || "").toUpperCase();
  const id = o.id || "";

  if (num.startsWith("MSV-")) return true;
  if (cur === "USD") return true;
  if (
    id === "f0000000-0000-0000-0000-000000000001" ||
    id === "f0000000-0000-0000-0000-000000000002" ||
    id === "a1111111-2222-3333-4444-555555555555" ||
    id === "d6dde5b4-3db8-4ebe-af91-bff7eaf01706"
  ) {
    return true;
  }
  return false;
}

/**
 * Fetch all real orders merged from disk, memory, and real Supabase orders
 */
export async function getUnifiedOrders(): Promise<Order[]> {
  globalThis.__VELLORE_LOCAL_ORDERS__ = readOrdersFromDisk();

  try {
    const supabase = getSupabaseClient();
    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false });

    if (!error && dbOrders && dbOrders.length > 0) {
      // Exclude template demo records
      const realDbOrders = (dbOrders as Order[]).filter((o) => !isDemoOrder(o));

      const dbIds = new Set(realDbOrders.map((o) => o.id || o.order_number));
      const localOnly = (globalThis.__VELLORE_LOCAL_ORDERS__ || []).filter(
        (lo) => !isDemoOrder(lo) && !dbIds.has(lo.id) && !dbIds.has(lo.order_number)
      );

      const merged = [...localOnly, ...realDbOrders];
      return merged;
    }
  } catch (err) {
    console.warn("Could not query Supabase orders:", err);
  }

  return (globalThis.__VELLORE_LOCAL_ORDERS__ || []).filter((o) => !isDemoOrder(o));
}

/**
 * Record a real customer order placed via checkout or manual admin entry
 */
export async function recordNewOrder(order: Order): Promise<void> {
  const current = await getUnifiedOrders();
  const updated = [order, ...current.filter((o) => o.id !== order.id && o.order_number !== order.order_number)];
  globalThis.__VELLORE_LOCAL_ORDERS__ = updated;
  writeOrdersToDisk(updated);
}

/**
 * Update order status
 */
export async function setUnifiedOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const current = await getUnifiedOrders();
  const updated = current.map((o) =>
    o.id === orderId || o.order_number === orderId
      ? { ...o, status, updated_at: new Date().toISOString() }
      : o
  );

  globalThis.__VELLORE_LOCAL_ORDERS__ = updated;
  writeOrdersToDisk(updated);

  // Attempt update in Supabase
  try {
    const supabase = getSupabaseClient();
    await supabase.from("orders").update({ status }).eq("id", orderId);
  } catch {
    // Continue
  }

  return true;
}

/**
 * Delete a single order
 */
export async function removeUnifiedOrder(orderId: string): Promise<boolean> {
  const current = await getUnifiedOrders();
  const filtered = current.filter(
    (o) => o.id !== orderId && o.order_number !== orderId
  );

  globalThis.__VELLORE_LOCAL_ORDERS__ = filtered;
  writeOrdersToDisk(filtered);

  // Attempt delete in Supabase
  try {
    const supabase = getSupabaseClient();
    await supabase.from("order_items").delete().eq("order_id", orderId);
    await supabase.from("orders").delete().eq("id", orderId);
  } catch {
    // Continue
  }

  return true;
}

/**
 * Find order by order number, phone number, or id
 */
export async function findUnifiedOrder(query: string): Promise<Order | null> {
  const cleanQuery = query.trim().toLowerCase().replace(/^#/, "");
  if (!cleanQuery) return null;

  const orders = await getUnifiedOrders();
  const cleanPhoneQuery = cleanQuery.replace(/\D/g, "");

  const found = orders.find((o) => {
    const orderNum = (o.order_number || "").toLowerCase();
    const phone = (o.phone || "").replace(/\D/g, "");
    const id = (o.id || "").toLowerCase();

    if (orderNum === cleanQuery) return true;
    if (orderNum.replace(/^vl-/, "") === cleanQuery) return true;
    if (orderNum.replace(/^vel-/, "") === cleanQuery) return true;
    if (id === cleanQuery) return true;
    if (cleanPhoneQuery.length >= 7 && phone.includes(cleanPhoneQuery)) return true;

    return false;
  });

  return found || null;
}

/**
 * Clear all runtime orders
 */
export function clearAllOrders(): void {
  globalThis.__VELLORE_LOCAL_ORDERS__ = [];
  writeOrdersToDisk([]);
}
