import React from "react";
import Link from "next/link";
import { formatPKR, formatDate } from "@/lib/format";
import {
  ShoppingBag,
  Clock,
  Coins,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
} from "lucide-react";
import { Order, Product } from "@/types";
import { getUnifiedOrders } from "@/lib/orders-store";
import { getUnifiedProducts } from "@/lib/products-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Fetch unified orders
  const orders: Order[] = await getUnifiedOrders();

  // Calculate aggregates
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(
    (o) => new Date(o.created_at).getTime() >= todayStart.getTime()
  ).length;

  // 2. Fetch low-stock products from unified store
  const allProducts = await getUnifiedProducts();
  const lowStockProducts: Product[] = allProducts
    .filter((p) => p.stock < 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      subtext: "All lifetime order records",
      icon: ShoppingBag,
      color: "text-blue-400",
      href: "/admin/orders",
    },
    {
      title: "Pending Fulfillment",
      value: pendingOrders.toString(),
      subtext: "Awaiting dispatch confirmation",
      icon: Clock,
      color: "text-amber-400",
      href: "/admin/orders",
    },
    {
      title: "Gross Revenue",
      value: formatPKR(totalRevenue),
      subtext: "Excluding cancellations",
      icon: Coins,
      color: "text-[#C6A15B]",
      href: "/admin/orders",
    },
    {
      title: "Active Orders",
      value: orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length.toString(),
      subtext: "In pipeline & transit",
      icon: TrendingUp,
      color: "text-emerald-400",
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#C6A15B]">
            Maison Executive Overview
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-serif text-[#F5F1E8]">
            VELLORE Operations Desk
          </h1>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C6A15B] text-[#0B0B0F] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#dfc299] transition-colors shadow-md"
        >
          <span>Orders Command</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="p-6 rounded-2xl bg-[#14151B] border border-white/5 hover:border-[#C6A15B]/40 transition-colors flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#F5F1E8]/60">
                  {card.title}
                </span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>

              <div>
                <span className="font-mono text-2xl sm:text-3xl font-semibold text-[#F5F1E8]">
                  {card.value}
                </span>
                <p className="mt-1 text-[11px] text-[#F5F1E8]/40 font-light">
                  {card.subtext}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Grid: Recent Orders (8 Cols) & Low Stock Alerts (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#F5F1E8]">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-mono text-[#C6A15B] hover:underline"
            >
              View All Orders &rarr;
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-white/5 bg-[#0E0F13]">
              <ShoppingBag className="w-10 h-10 text-[#F5F1E8]/20 mx-auto mb-3" />
              <p className="font-serif text-lg text-[#F5F1E8]">No orders yet.</p>
              <p className="mt-1 text-xs text-[#F5F1E8]/40">
                New orders placed on the storefront will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#F5F1E8]/40 uppercase font-mono text-[10px]">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Client</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 font-mono text-[#C6A15B] font-medium">
                        {order.order_number}
                      </td>
                      <td className="py-3 text-[#F5F1E8]">{order.customer_name}</td>
                      <td className="py-3 text-[#F5F1E8]/70">{order.city}</td>
                      <td className="py-3 font-mono text-[#F5F1E8]">
                        {formatPKR(Number(order.total))}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                            order.status === "Pending"
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              : order.status === "Delivered"
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              : order.status === "Shipped"
                              ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                              : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[#F5F1E8]/40 font-mono text-[11px]">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-xl text-[#F5F1E8]">Inventory Watch</h2>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-[#F5F1E8]/50 py-6">
              All timepiece models have healthy inventory levels (&ge; 10 units).
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-[#0E0F13] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-medium text-[#F5F1E8]">{p.name}</h4>
                    <span className="text-[10px] font-mono text-[#F5F1E8]/40 uppercase">
                      {p.category}
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/products"
            className="block text-center w-full py-2.5 rounded-xl border border-white/10 hover:border-[#C6A15B] text-xs font-mono uppercase text-[#F5F1E8] transition-colors"
          >
            Manage Product Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
