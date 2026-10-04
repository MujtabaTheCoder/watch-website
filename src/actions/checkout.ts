"use server";

import { headers } from "next/headers";
import { checkoutSchema, normalizePakistaniPhone } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@supabase/supabase-js";
import { CreateOrderResult, Order, OrderItem } from "@/types";
import { DEFAULT_PRODUCTS } from "@/lib/default-products";
import { recordNewOrder } from "@/lib/orders-store";

interface CartItemPayload {
  product_id: string;
  quantity: number;
}

export async function processCheckoutAction(
  formData: {
    customer_name: string;
    phone: string;
    city: string;
    address: string;
    notes?: string;
    payment_method: string;
    website_hp?: string;
    idempotency_key: string;
  },
  items: CartItemPayload[]
): Promise<CreateOrderResult> {
  try {
    // 1. Bot Honeypot Check
    if (formData.website_hp && formData.website_hp.length > 0) {
      return { success: false, error: "Submission rejected by anti-bot verification." };
    }

    // 2. Schema Validation
    const parsed = checkoutSchema.safeParse(formData);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((e) => e.message).join(", ");
      return { success: false, error: errorMsg };
    }

    // 3. Rate Limiting Protection (per IP and per Phone)
    const headerList = await headers();
    const clientIp =
      headerList.get("x-forwarded-for")?.split(",")[0].trim() ||
      headerList.get("x-real-ip") ||
      "127.0.0.1";

    const normalizedPhone = normalizePakistaniPhone(parsed.data.phone);

    const ipLimit = await rateLimit(`checkout-ip-${clientIp}`, { limit: 12, windowMs: 60000 });
    if (!ipLimit.success) {
      return {
        success: false,
        error: "Too many checkout attempts from this connection. Please wait a moment.",
      };
    }

    const phoneLimit = await rateLimit(`checkout-phone-${normalizedPhone}`, {
      limit: 6,
      windowMs: 60000,
    });
    if (!phoneLimit.success) {
      return {
        success: false,
        error: "Too many orders requested with this mobile number. Please wait a moment.",
      };
    }

    // 4. Validate Cart Items
    if (!items || items.length === 0) {
      return { success: false, error: "Your bag is empty." };
    }

    // Calculate line items and totals
    const detailedItems: OrderItem[] = items.map((cartItem) => {
      const product =
        DEFAULT_PRODUCTS.find((p) => p.id === cartItem.product_id) ||
        DEFAULT_PRODUCTS.find((p) => p.slug === cartItem.product_id) ||
        DEFAULT_PRODUCTS[0];
      const price = product.discount_price ?? product.price;
      return {
        id: "item-" + Math.random().toString(36).substring(2, 9),
        product_id: product.id,
        name_snapshot: product.name,
        price_snapshot: price,
        quantity: cartItem.quantity,
        image: product.images[0] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
      };
    });

    const calculatedSubtotal = detailedItems.reduce((acc, i) => acc + i.price_snapshot * i.quantity, 0);
    const deliveryFee = calculatedSubtotal >= 15000 ? 0 : 250;
    const calculatedTotal = calculatedSubtotal + deliveryFee;
    const randomOrderNumber = "VL-" + Math.floor(1000 + Math.random() * 9000).toString();

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycwxjqwktazjttmjglla.supabase.co";
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_guRi1Uo2lCJPfAAFPEJ_Sw_kel-CFVX";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // 5. Try Atomic Postgres RPC `create_order`
    let finalOrderId = "ord-" + Math.random().toString(36).substring(2, 10);
    let finalOrderNumber = randomOrderNumber;
    let isDuplicate = false;

    const { data: rpcData, error: rpcError } = await supabase.rpc("create_order", {
      p_customer_name: parsed.data.customer_name,
      p_phone: normalizedPhone,
      p_city: parsed.data.city,
      p_address: parsed.data.address,
      p_notes: parsed.data.notes || "",
      p_payment_method: parsed.data.payment_method || "COD",
      p_idempotency_key: formData.idempotency_key,
      p_items: items,
    });

    if (rpcError) {
      // Fallback: direct insert or runtime storage
      if (rpcError.message.includes("OUT_OF_STOCK")) {
        return {
          success: false,
          error: "One or more items in your cart just sold out. Please review your cart.",
        };
      }

      // Check if order with idempotency_key already exists in DB
      try {
        const { data: existing } = await supabase
          .from("orders")
          .select("id, order_number, total")
          .eq("idempotency_key", formData.idempotency_key)
          .maybeSingle();

        if (existing) {
          return {
            success: true,
            order_id: existing.id,
            order_number: existing.order_number,
            total: Number(existing.total),
            is_duplicate: true,
          };
        }

        const { data: insertedOrder } = await supabase
          .from("orders")
          .insert({
            order_number: randomOrderNumber,
            idempotency_key: formData.idempotency_key,
            customer_name: parsed.data.customer_name,
            phone: normalizedPhone,
            city: parsed.data.city,
            address: parsed.data.address,
            notes: parsed.data.notes || "",
            payment_method: parsed.data.payment_method || "COD",
            status: "Pending",
            subtotal: calculatedSubtotal,
            delivery_fee: deliveryFee,
            total: calculatedTotal,
          })
          .select("id, order_number, total")
          .single();

        if (insertedOrder) {
          finalOrderId = insertedOrder.id;
          finalOrderNumber = insertedOrder.order_number;

          // Attempt to insert order items
          const itemsToInsert = detailedItems.map((item) => ({
            order_id: insertedOrder.id,
            product_id: item.product_id.length === 36 ? item.product_id : null,
            name_snapshot: item.name_snapshot,
            price_snapshot: item.price_snapshot,
            quantity: item.quantity,
            image: item.image,
          }));
          await supabase.from("order_items").insert(itemsToInsert);
        }
      } catch (insertErr) {
        console.warn("Direct Supabase write skipped, storing in unified store:", insertErr);
      }
    } else if (rpcData) {
      finalOrderId = rpcData.order_id || finalOrderId;
      finalOrderNumber = rpcData.order_number || finalOrderNumber;
      isDuplicate = rpcData.is_duplicate ?? false;
    }

    // Record into unified order registry so Admin sees it immediately
    const orderRecord: Order = {
      id: finalOrderId,
      order_number: finalOrderNumber,
      idempotency_key: formData.idempotency_key,
      customer_name: parsed.data.customer_name,
      phone: normalizedPhone,
      city: parsed.data.city,
      address: parsed.data.address,
      notes: parsed.data.notes || "",
      payment_method: parsed.data.payment_method || "COD",
      status: "Pending",
      subtotal: calculatedSubtotal,
      delivery_fee: deliveryFee,
      total: calculatedTotal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: detailedItems,
    };

    await recordNewOrder(orderRecord);

    return {
      success: true,
      order_id: finalOrderId,
      order_number: finalOrderNumber,
      total: calculatedTotal,
      is_duplicate: isDuplicate,
    };
  } catch (err) {
    console.error("Checkout execution error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing your order. Please try again.",
    };
  }
}
