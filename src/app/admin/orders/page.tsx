import React from "react";
import { OrdersCommandCenter } from "@/components/admin/OrdersCommandCenter";
import { getUnifiedOrders } from "@/lib/orders-store";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const initialOrders = await getUnifiedOrders();

  return <OrdersCommandCenter initialOrders={initialOrders} />;
}
