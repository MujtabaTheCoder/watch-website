"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { updateOrderStatusAction, deleteOrderAction, clearAllOrdersAction } from "@/actions/admin";
import { Order, OrderStatus } from "@/types";
import { formatPKR, formatDate, getWhatsAppOrderUrl } from "@/lib/format";
import { DEFAULT_PRODUCTS } from "@/lib/default-products";
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Printer,
  MessageCircle,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  Radio,
  BellRing,
  PlusCircle,
  Package,
  Layers,
  MapPin,
  Phone,
  User,
  DollarSign,
  Shield,
  FileText,
  Trash2,
} from "lucide-react";

interface OrdersCommandCenterProps {
  initialOrders: Order[];
}

export function OrdersCommandCenter({ initialOrders }: OrdersCommandCenterProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [printInvoiceMode, setPrintInvoiceMode] = useState(false);

  // New Order Form state
  const [newCustName, setNewCustName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCity, setNewCity] = useState("Lahore");
  const [newAddress, setNewAddress] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPayment, setNewPayment] = useState("COD");
  const [newProductId, setNewProductId] = useState(DEFAULT_PRODUCTS[0]?.id || "");
  const [newQuantity, setNewQuantity] = useState(1);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // 1. Filter & Search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "All" || order.status.toLowerCase() === statusFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.order_number.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.phone.toLowerCase().includes(q) ||
        order.city.toLowerCase().includes(q) ||
        (order.items && order.items.some((i) => i.name_snapshot.toLowerCase().includes(q)));

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // 2. Metrics summary
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const confirmed = orders.filter((o) => o.status === "Confirmed").length;
    const shipped = orders.filter((o) => o.status === "Shipped").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const totalRevenue = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    return { total, pending, confirmed, shipped, delivered, totalRevenue };
  }, [orders]);

  // 3. Status Update Handler
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(orderId);

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    await updateOrderStatusAction(orderId, newStatus);
    setIsUpdatingStatus(null);
  };

  // Delete Individual Order Handler
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to permanently delete this order?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
    await deleteOrderAction(orderId);
  };

  // Clear All Orders Handler
  const handleClearAllOrders = async () => {
    if (!confirm("Are you sure you want to clear all order records? This cannot be undone.")) return;
    setOrders([]);
    setSelectedOrder(null);
    await clearAllOrdersAction();
  };

  // 4. Create Manual Order Handler
  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newPhone || !newAddress) return;

    setIsCreatingOrder(true);
    const selectedProd = DEFAULT_PRODUCTS.find((p) => p.id === newProductId) || DEFAULT_PRODUCTS[0];
    const unitPrice = selectedProd.discount_price ?? selectedProd.price;
    const subtotal = unitPrice * newQuantity;
    const deliveryFee = subtotal >= 15000 ? 0 : 250;
    const total = subtotal + deliveryFee;

    const newOrder: Order = {
      id: "ord-manual-" + Date.now(),
      order_number: "VL-" + Math.floor(1000 + Math.random() * 9000),
      idempotency_key: "idem-manual-" + Date.now(),
      customer_name: newCustName,
      phone: newPhone,
      city: newCity,
      address: newAddress,
      notes: newNotes,
      payment_method: newPayment,
      status: "Confirmed",
      subtotal,
      delivery_fee: deliveryFee,
      total,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [
        {
          id: "item-" + Date.now(),
          product_id: selectedProd.id,
          name_snapshot: selectedProd.name,
          price_snapshot: unitPrice,
          quantity: newQuantity,
          image: selectedProd.images[0] || "/placeholder-watch.jpg",
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setShowNewOrderModal(false);
    setIsCreatingOrder(false);
    setNewOrderAlert(newOrder.order_number);

    // Reset inputs
    setNewCustName("");
    setNewPhone("");
    setNewAddress("");
    setNewNotes("");
  };

  // 5. Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      "Order Number",
      "Customer Name",
      "Phone",
      "City",
      "Address",
      "Payment Method",
      "Status",
      "Items Count",
      "Items List",
      "Subtotal (PKR)",
      "Delivery Fee (PKR)",
      "Total (PKR)",
      "Created At",
    ];

    const rows = orders.map((o) => {
      const itemsList = (o.items || [])
        .map((i) => `${i.quantity}x ${i.name_snapshot}`)
        .join("; ");
      return [
        `"${o.order_number}"`,
        `"${o.customer_name.replace(/"/g, '""')}"`,
        `"${o.phone}"`,
        `"${o.city.replace(/"/g, '""')}"`,
        `"${o.address.replace(/"/g, '""')}"`,
        `"${o.payment_method}"`,
        `"${o.status}"`,
        (o.items || []).length,
        `"${itemsList.replace(/"/g, '""')}"`,
        o.subtotal,
        o.delivery_fee,
        o.total,
        `"${o.created_at}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vellore_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusOptions: OrderStatus[] = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  return (
    <div className="space-y-6">
      {/* Realtime Alert Banner */}
      {newOrderAlert && (
        <div className="p-4 rounded-2xl bg-[#C6A15B]/20 border border-[#C6A15B] text-[#F5F1E8] flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-[#C6A15B] animate-bounce" />
            <div>
              <span className="font-mono font-bold text-[#C6A15B]">
                Order Confirmed: #{newOrderAlert}
              </span>
              <p className="text-xs text-[#F5F1E8]/80">
                The order dossier has been logged into the operations queue.
              </p>
            </div>
          </div>
          <button
            onClick={() => setNewOrderAlert(null)}
            className="p-1 hover:bg-white/10 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C6A15B]">
              Realtime Order Gateway
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-serif text-[#F5F1E8]">
            Orders Command Center
          </h1>
          <p className="text-xs text-[#F5F1E8]/50 mt-1">
            Complete order ledger with client dossiers, item snapshots &amp; courier fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C6A15B] hover:bg-[#dfc299] text-[#0B0B0F] font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manual Order</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-[#16161D] hover:bg-[#1E2028] text-xs font-mono tracking-wider flex items-center gap-2 text-[#F5F1E8] transition-colors"
          >
            <Download className="w-4 h-4 text-[#C6A15B]" />
            <span>Export CSV</span>
          </button>

          {orders.length > 0 && (
            <button
              onClick={handleClearAllOrders}
              className="px-3.5 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-xs font-mono tracking-wider flex items-center gap-1.5 text-red-300 transition-colors"
              title="Clear all demo / test order records"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear Orders</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Card Operational Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#14151B] border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#F5F1E8]/50">Total Ledger</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-mono font-semibold text-[#F5F1E8]">
              {metrics.total}
            </span>
            <span className="text-[10px] font-mono text-blue-400">All Orders</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14151B] border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#F5F1E8]/50">Pending Action</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-mono font-semibold text-amber-300">
              {metrics.pending}
            </span>
            <span className="text-[10px] font-mono text-amber-400/80">Needs Dispatch</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14151B] border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#F5F1E8]/50">In-Transit</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-mono font-semibold text-purple-300">
              {metrics.shipped}
            </span>
            <span className="text-[10px] font-mono text-purple-400/80">Courier</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14151B] border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#F5F1E8]/50">Delivered</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-mono font-semibold text-emerald-300">
              {metrics.delivered}
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80">Settled</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14151B] border border-white/5 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-[#F5F1E8]/50">Gross Revenue</span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-mono font-semibold text-[#C6A15B]">
              {formatPKR(metrics.totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#14151B] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {["All", ...statusOptions].map((tab) => {
            const isSelected = statusFilter.toLowerCase() === tab.toLowerCase();
            const count =
              tab === "All"
                ? orders.length
                : orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase()).length;

            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#C6A15B] text-[#0B0B0F] font-semibold shadow-sm"
                    : "bg-[#0E0F13] text-[#F5F1E8]/70 hover:text-white border border-white/5"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-black/20 text-[#0B0B0F]" : "bg-white/10 text-[#F5F1E8]/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#F5F1E8]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, phone, name, watch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E0F13] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B]"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="rounded-3xl bg-[#14151B] border border-white/10 overflow-hidden shadow-2xl">
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center px-6">
            <ShoppingBag className="w-12 h-12 text-[#F5F1E8]/20 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-[#F5F1E8]">No orders yet. New orders will appear here.</h3>
            <p className="mt-1 text-xs text-[#F5F1E8]/40 max-w-sm mx-auto">
              {orders.length === 0
                ? "Customer orders placed from the website will arrive here in real-time."
                : "No orders match your current filter and search parameters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#0E0F13]/70 text-[#F5F1E8]/50 uppercase font-mono text-[10px]">
                  <th className="py-3.5 px-5">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Timepieces</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const items = order.items || [];
                  const totalUnits = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
                  const firstItem = items[0];

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                    >
                      {/* Order Number */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-[#C6A15B]">
                            {order.order_number}
                          </span>
                        </div>
                      </td>

                      {/* Customer Name */}
                      <td className="py-4 px-4 font-medium text-[#F5F1E8]">
                        {order.customer_name}
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4 font-mono text-[#F5F1E8]/80 whitespace-nowrap">
                        {order.phone}
                      </td>

                      {/* Timepieces / Items Preview */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {firstItem?.image && (
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                              <Image
                                src={firstItem.image}
                                alt={firstItem.name_snapshot}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="truncate max-w-[140px]">
                            <span className="text-[11px] text-[#F5F1E8] truncate block">
                              {firstItem?.name_snapshot || "Haute Horology"}
                            </span>
                            {items.length > 1 && (
                              <span className="text-[10px] text-[#C6A15B] font-mono">
                                +{items.length - 1} more ({totalUnits} total)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-4 px-4 text-[#F5F1E8]/70 whitespace-nowrap">
                        {order.city}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 font-mono text-sm font-semibold text-[#F5F1E8] whitespace-nowrap">
                        {formatPKR(Number(order.total))}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-[10px] text-[#F5F1E8]/70">
                          {order.payment_method}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          disabled={isUpdatingStatus === order.id}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border bg-[#0E0F13] focus:outline-none cursor-pointer ${
                            order.status === "Pending"
                              ? "border-amber-500/40 text-amber-300"
                              : order.status === "Confirmed"
                              ? "border-blue-500/40 text-blue-300"
                              : order.status === "Shipped"
                              ? "border-purple-500/40 text-purple-300"
                              : order.status === "Delivered"
                              ? "border-emerald-500/40 text-emerald-300"
                              : "border-red-500/40 text-red-300"
                          }`}
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st} className="bg-[#0E0F13] text-[#F5F1E8]">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 font-mono text-[11px] text-[#F5F1E8]/50 whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={getWhatsAppOrderUrl({
                            phone: order.phone,
                            orderNumber: order.order_number,
                            customerName: order.customer_name,
                            total: Number(order.total),
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex p-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#25D366] transition-colors"
                          title="Open WhatsApp with Prefilled Message"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F5F1E8]/70 hover:text-white transition-colors"
                          title="View Order Dossier & Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="inline-flex p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Order Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Order Creation Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#14151B] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B]">
                  Manual Order Entry
                </span>
                <h3 className="font-serif text-2xl text-[#F5F1E8]">Log Manual Order</h3>
              </div>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-[#F5F1E8]/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs">
              {/* Product Selection */}
              <div>
                <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Select Timepiece</label>
                <select
                  value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value)}
                  className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                >
                  {DEFAULT_PRODUCTS.map((prod) => (
                    <option key={prod.id} value={prod.id} className="bg-[#0E0F13]">
                      {prod.name} — {formatPKR(prod.discount_price ?? prod.price)} ({prod.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Payment Mode</label>
                  <select
                    value={newPayment}
                    onChange={(e) => setNewPayment(e.target.value)}
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                    <option value="IN_PERSON">Direct Handover Settlement</option>
                  </select>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Riaz"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Mobile / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Destination City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Special Instructions</label>
                  <input
                    type="text"
                    placeholder="Delivery notes..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Street Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Complete villa, apartment or office address..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-[#0E0F13] border border-white/10 rounded-xl p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/5 text-xs text-[#F5F1E8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="px-6 py-2.5 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] text-[#0B0B0F] font-mono text-xs uppercase tracking-wider font-semibold transition-colors shadow-md"
                >
                  Confirm &amp; Log Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Order Detail Dossier & Luxury Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#14151B] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E0F13] border border-white/10 flex items-center justify-center text-[#C6A15B]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B]">
                    Horological Order Dossier
                  </span>
                  <h3 className="font-serif text-2xl text-[#F5F1E8]">
                    #{selectedOrder.order_number}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-[#0E0F13] hover:bg-white/10 text-xs font-mono text-[#F5F1E8] flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-[#F5F1E8]/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Client Coordinates & Fulfillment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#0E0F13] border border-white/5 space-y-2">
                <span className="text-[#F5F1E8]/40 uppercase font-mono text-[10px] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#C6A15B]" />
                  Client Profile
                </span>
                <p className="font-semibold text-base text-[#F5F1E8]">{selectedOrder.customer_name}</p>
                <div className="flex items-center gap-2 font-mono text-sm text-[#C6A15B]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedOrder.phone}</span>
                </div>
                <div className="pt-2">
                  <a
                    href={getWhatsAppOrderUrl({
                      phone: selectedOrder.phone,
                      orderNumber: selectedOrder.order_number,
                      customerName: selectedOrder.customer_name,
                      total: Number(selectedOrder.total),
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:underline font-mono"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Liaise directly via WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0E0F13] border border-white/5 space-y-2">
                <span className="text-[#F5F1E8]/40 uppercase font-mono text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C6A15B]" />
                  Courier Destination
                </span>
                <p className="font-semibold text-sm text-[#F5F1E8]">{selectedOrder.city}, Pakistan</p>
                <p className="text-[#F5F1E8]/70 leading-relaxed text-xs">{selectedOrder.address}</p>
                {selectedOrder.notes && (
                  <p className="text-[11px] text-[#C6A15B]/90 italic bg-white/5 p-2 rounded-lg mt-1">
                    &ldquo;{selectedOrder.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Timepieces Ordered Items List */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#F5F1E8]/50 block">
                Timepieces Ordered ({(selectedOrder.items || []).length} SKU)
              </span>

              <div className="rounded-2xl bg-[#0E0F13] border border-white/5 divide-y divide-white/5 overflow-hidden">
                {(selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items : [
                  {
                    id: "default-1",
                    name_snapshot: "Vellore Sovereign Chronograph",
                    price_snapshot: Number(selectedOrder.subtotal) || Number(selectedOrder.total),
                    quantity: 1,
                    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
                  },
                ]).map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                        <Image
                          src={item.image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"}
                          alt={item.name_snapshot}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[#F5F1E8]">{item.name_snapshot}</h4>
                        <span className="text-xs font-mono text-[#F5F1E8]/60">
                          {formatPKR(item.price_snapshot)} &times; {item.quantity} Unit{item.quantity > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-semibold text-[#C6A15B]">
                        {formatPKR(item.price_snapshot * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-[#0E0F13] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-[#F5F1E8]/70">
                <span>Atelier Subtotal</span>
                <span className="font-mono">{formatPKR(Number(selectedOrder.subtotal))}</span>
              </div>
              <div className="flex justify-between text-[#F5F1E8]/70">
                <span>Armored Courier &amp; Insurance</span>
                <span className="font-mono text-emerald-400">
                  {selectedOrder.delivery_fee === 0 ? "FREE (Complimentary)" : formatPKR(selectedOrder.delivery_fee)}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-medium text-[#F5F1E8]">
                <span>Total Settlement (PKR)</span>
                <span className="font-mono text-base font-bold text-[#C6A15B]">
                  {formatPKR(Number(selectedOrder.total))}
                </span>
              </div>
            </div>

            {/* Status Control & Logistics Bar */}
            <div className="p-4 rounded-2xl bg-[#0E0F13] border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-[#F5F1E8]/40 uppercase font-mono text-[10px] block">
                  Payment Protocol
                </span>
                <span className="font-mono font-medium text-sm text-[#F5F1E8]">
                  {selectedOrder.payment_method === "COD"
                    ? "Cash on Delivery (Armored Settlement)"
                    : selectedOrder.payment_method}
                </span>
              </div>

              <div>
                <span className="text-[#F5F1E8]/40 uppercase font-mono text-[10px] block mb-1">
                  Update Fulfillment Status
                </span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-[#16161D] border border-white/15 text-xs font-mono font-medium text-[#C6A15B] focus:outline-none"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <a
                href={getWhatsAppOrderUrl({
                  phone: selectedOrder.phone,
                  orderNumber: selectedOrder.order_number,
                  customerName: selectedOrder.customer_name,
                  total: Number(selectedOrder.total),
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-[#0B0B0F] font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
              </a>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-full border border-white/10 bg-[#16161D] hover:bg-white/10 text-xs font-mono uppercase tracking-wider flex items-center gap-2 text-[#F5F1E8] transition-colors"
              >
                <Printer className="w-4 h-4 text-[#C6A15B]" />
                <span>Print Official Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
