"use server";

import { findUnifiedOrder } from "@/lib/orders-store";
import { Order } from "@/types";

export interface TrackingTimelineStep {
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  timestamp?: string;
}

export interface TrackOrderResult {
  success: boolean;
  error?: string;
  order?: {
    order_number: string;
    status: string;
    created_at: string;
    customer_name: string;
    city: string;
    address: string;
    payment_method: string;
    subtotal: number;
    delivery_fee: number;
    total: number;
    items: {
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }[];
    courier: string;
    tracking_number: string;
    estimated_delivery: string;
    timeline: TrackingTimelineStep[];
  };
}

export async function trackOrderAction(identifier: string): Promise<TrackOrderResult> {
  try {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return { success: false, error: "Please enter your order number or phone number." };
    }

    const order = await findUnifiedOrder(trimmed);

    if (!order) {
      return {
        success: false,
        error: `No order found for "${trimmed}". Please double-check your order number (e.g. VL-1234) or the phone number used at checkout.`,
      };
    }

    const status = order.status || "Pending";

    // Determine status step indices:
    // 1: Pending (Order Placed)
    // 2: Confirmed (QC & Sizing Verified)
    // 3: Shipped (Dispatched in Transit)
    // 4: Delivered (Handed to Customer)
    let activeStep = 1;
    if (status === "Confirmed") activeStep = 2;
    if (status === "Shipped") activeStep = 3;
    if (status === "Delivered") activeStep = 4;
    if (status === "Cancelled") activeStep = 0;

    const timeline: TrackingTimelineStep[] = [
      {
        step: 1,
        title: "Order Placed",
        description: "Your order was successfully registered in the VELLORE dispatch system.",
        isCompleted: activeStep >= 1 && status !== "Cancelled",
        isCurrent: activeStep === 1,
        timestamp: new Date(order.created_at).toLocaleDateString("en-PK", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      {
        step: 2,
        title: "Confirmed & QC Passed",
        description: "Timepiece inspected by horologists and packed in luxury presentation gift box.",
        isCompleted: activeStep >= 2 && status !== "Cancelled",
        isCurrent: activeStep === 2,
      },
      {
        step: 3,
        title: "Dispatched with Courier",
        description: "Handed over to armored express courier for insured transit across Pakistan.",
        isCompleted: activeStep >= 3 && status !== "Cancelled",
        isCurrent: activeStep === 3,
      },
      {
        step: 4,
        title: "Delivered",
        description: "Delivered to your doorstep with open-parcel inspection & COD settlement.",
        isCompleted: activeStep >= 4 && status !== "Cancelled",
        isCurrent: activeStep === 4,
      },
    ];

    const estimatedDays = status === "Delivered" ? "Delivered" : "2–4 Business Days";

    return {
      success: true,
      order: {
        order_number: order.order_number,
        status: order.status,
        created_at: order.created_at,
        customer_name: order.customer_name,
        city: order.city,
        address: order.address,
        payment_method: order.payment_method || "Cash on Delivery (COD)",
        subtotal: order.subtotal,
        delivery_fee: order.delivery_fee,
        total: order.total,
        items: (order.items || []).map((i) => ({
          name: i.name_snapshot,
          price: i.price_snapshot,
          quantity: i.quantity,
          image: i.image,
        })),
        courier: "Armored Express Logistics (Nationwide Courier)",
        tracking_number: "TRK-" + order.order_number.replace(/^VL-/, ""),
        estimated_delivery: estimatedDays,
        timeline,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to look up order. Please try again.",
    };
  }
}
