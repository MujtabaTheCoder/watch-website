// ============================================================================
// VELLORE — Core TypeScript Type Definitions
// Strict typing with zero `any`
// ============================================================================

export type ProductCategory =
  | "Classic"
  | "Sport"
  | "Minimal"
  | "Luxe"
  | "Gifting"
  | "Luxury"
  | "Minimalist"
  | "Sports"
  | "Women"
  | "Unisex";

export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "JAZZCASH_EASYPAISA";

export interface WatchSpecs {
  case_size: string;
  movement: string;
  strap: string;
  water_resistance: string;
  glass: string;
  warranty: string;
  [key: string]: string;
}

export interface Watch3DConfig {
  case_color: string;
  dial_color: string;
  strap_color: string;
  accents: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  category: string;
  images: string[];
  specs: WatchSpecs;
  model_config: Watch3DConfig;
  stock: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  image?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  idempotency_key: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string | null;
  payment_method: PaymentMethod | string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminStats {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  today_orders: number;
  today_revenue: number;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  whatsapp_number: string;
  standard_delivery_fee: number;
  free_delivery_threshold: number;
  support_email: string;
  support_phone: string;
}

export interface CheckoutInput {
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  payment_method: PaymentMethod | string;
  honeypot?: string;
}

export interface CreateOrderResult {
  success: boolean;
  order_id?: string;
  order_number?: string;
  total?: number;
  error?: string;
  is_duplicate?: boolean;
}
