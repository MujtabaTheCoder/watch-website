"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  ArrowRight,
  MapPin,
  Calendar,
  ShoppingBag,
  RotateCcw,
} from "lucide-react";
import { trackOrderAction, TrackOrderResult } from "@/actions/track";
import { formatPKR } from "@/lib/format";
import { getWhatsAppConciergeUrl } from "@/lib/format";

export function OrderTrackingView() {
  const searchParams = useSearchParams();
  const initialOrderQuery = searchParams.get("order") || "";

  const [query, setQuery] = useState(initialOrderQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackOrderResult | null>(null);

  // Auto-lookup if ?order= param is passed in URL
  useEffect(() => {
    if (initialOrderQuery) {
      handleSearch(initialOrderQuery);
    }
  }, [initialOrderQuery]);

  const handleSearch = async (searchTerm?: string) => {
    const term = searchTerm || query;
    if (!term.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await trackOrderAction(term);
      setResult(res);
    } catch {
      setResult({
        success: false,
        error: "Unable to connect to order tracking service. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          bg: "bg-amber-500/15 border-amber-500/30 text-amber-300",
          dot: "bg-amber-400",
          text: "Order Placed & Queued",
        };
      case "Confirmed":
        return {
          bg: "bg-blue-500/15 border-blue-500/30 text-blue-300",
          dot: "bg-blue-400",
          text: "Confirmed & In Packaging",
        };
      case "Shipped":
        return {
          bg: "bg-purple-500/15 border-purple-500/30 text-purple-300",
          dot: "bg-purple-400",
          text: "In Transit with Courier",
        };
      case "Delivered":
        return {
          bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
          dot: "bg-emerald-400",
          text: "Successfully Delivered",
        };
      case "Cancelled":
        return {
          bg: "bg-red-500/15 border-red-500/30 text-red-300",
          dot: "bg-red-400",
          text: "Cancelled",
        };
      default:
        return {
          bg: "bg-white/10 border-white/20 text-[#F5F1E8]",
          dot: "bg-[#C6A15B]",
          text: status,
        };
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#C6A15B] block font-semibold">
          LIVE NATIONWIDE COURIER DISPATCH
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif text-[#F5F1E8] tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-light max-w-lg mx-auto">
          Enter your VELLORE Order Number or phone number to view real-time delivery status, QC inspection, and courier transit across Pakistan.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#0E0F14] border border-[#C6A15B]/30 shadow-2xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative w-full flex-1">
            <Search className="w-4 h-4 text-[#C6A15B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Order # (e.g. VL-1082) or Mobile # (03001234567)"
              className="w-full bg-[#14151C] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-[#F5F1E8] placeholder:text-[#F5F1E8]/35 focus:outline-none focus:border-[#C6A15B] font-mono transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#C6A15B] hover:bg-[#dfc299] text-[#08080B] font-mono font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 flex-shrink-0"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <span>Track Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#F5F1E8]/50 pt-2 border-t border-white/5">
          <span>Tracking operates 24/7 across all Pakistani courier networks</span>
          <span>Insured Armored Couriers</span>
        </div>
      </div>

      {/* Error State */}
      {result && !result.success && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 space-y-2 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <h4 className="font-semibold text-red-300">Tracking Information Not Found</h4>
            <p className="font-light text-red-200/80">{result.error}</p>
            <p className="text-[11px] text-red-200/60 pt-1">
              Need assistance? Connect with our WhatsApp Support at{" "}
              <a
                href={getWhatsAppConciergeUrl("Salam, I need assistance tracking my watch order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-red-300 hover:text-white"
              >
                +92 300 1234567
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Active Order Tracking Result */}
      {result?.success && result.order && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Order Snapshot Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E0F14] border border-white/10 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F5F1E8]/50 block">
                  ORDER REFERENCE
                </span>
                <h3 className="font-mono text-2xl font-bold text-[#F5F1E8] tracking-wider mt-0.5">
                  #{result.order.order_number}
                </h3>
              </div>

              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono font-medium ${
                  getStatusBadge(result.order.status).bg
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    getStatusBadge(result.order.status).dot
                  }`}
                />
                <span>{getStatusBadge(result.order.status).text}</span>
              </div>
            </div>

            {/* Quick Meta Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-[#14151C] border border-white/5 space-y-1">
                <span className="text-[10px] text-[#F5F1E8]/40 block uppercase">Destination</span>
                <span className="text-[#F5F1E8] font-semibold block">{result.order.city}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#14151C] border border-white/5 space-y-1">
                <span className="text-[10px] text-[#F5F1E8]/40 block uppercase">Payment Method</span>
                <span className="text-[#F5F1E8] font-semibold block truncate">
                  {result.order.payment_method}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#14151C] border border-white/5 space-y-1">
                <span className="text-[10px] text-[#F5F1E8]/40 block uppercase">Estimated Arrival</span>
                <span className="text-[#C6A15B] font-semibold block">
                  {result.order.estimated_delivery}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#14151C] border border-white/5 space-y-1">
                <span className="text-[10px] text-[#F5F1E8]/40 block uppercase">Total Payable</span>
                <span className="text-[#F5F1E8] font-semibold block">
                  {formatPKR(result.order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Tracking Progress Stepper */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E0F14] border border-white/10 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-[#F5F1E8]">Delivery Progress</h3>
              <span className="text-[11px] font-mono text-[#C6A15B] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>{result.order.courier}</span>
              </span>
            </div>

            {/* Stepper Steps */}
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
              {result.order.timeline.map((step) => {
                return (
                  <div key={step.step} className="relative flex items-start gap-4">
                    {/* Step Icon / Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-all ${
                        step.isCompleted
                          ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                          : step.isCurrent
                          ? "bg-[#C6A15B] text-black ring-4 ring-[#C6A15B]/20 animate-pulse"
                          : "bg-[#1A1A22] text-[#F5F1E8]/40 border border-white/10"
                      }`}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span>{step.step}</span>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h4
                          className={`font-serif text-base sm:text-lg ${
                            step.isCompleted || step.isCurrent
                              ? "text-[#F5F1E8] font-medium"
                              : "text-[#F5F1E8]/40 font-light"
                          }`}
                        >
                          {step.title}
                        </h4>
                        {step.timestamp && (
                          <span className="text-[10px] font-mono text-[#C6A15B]">
                            {step.timestamp}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#F5F1E8]/65 font-light leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Timepieces Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E0F14] border border-white/10 space-y-6 shadow-xl">
            <h3 className="font-serif text-xl text-[#F5F1E8]">Order Details</h3>

            <div className="divide-y divide-white/5">
              {result.order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#161720] border border-white/10 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C6A15B]">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-serif text-sm sm:text-base text-[#F5F1E8]">
                        {item.name}
                      </h4>
                      <span className="text-xs font-mono text-[#F5F1E8]/50">
                        Qty: {item.quantity} &bull; {formatPKR(item.price)} each
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs sm:text-sm font-semibold text-[#F5F1E8]">
                    {formatPKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#F5F1E8]/70">
                <span>Subtotal</span>
                <span>{formatPKR(result.order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#F5F1E8]/70">
                <span>Courier Delivery</span>
                <span>
                  {result.order.delivery_fee === 0 ? "FREE" : formatPKR(result.order.delivery_fee)}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-[#C6A15B] pt-2 border-t border-white/5">
                <span>Total Amount</span>
                <span>{formatPKR(result.order.total)}</span>
              </div>
            </div>

            {/* Delivery Recipient Details */}
            <div className="p-4 rounded-2xl bg-[#14151C] border border-white/5 space-y-2 text-xs font-mono">
              <span className="text-[10px] uppercase text-[#C6A15B] font-semibold block tracking-wider">
                DELIVERY RECIPIENT
              </span>
              <p className="text-[#F5F1E8] font-semibold">{result.order.customer_name}</p>
              <p className="text-[#F5F1E8]/70">{result.order.address}</p>
              <p className="text-[#F5F1E8]/70">{result.order.city}, Pakistan</p>
            </div>
          </div>

          {/* WhatsApp Liaison Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#121319] via-[#0E0F14] to-[#121319] border border-[#25D366]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif text-lg text-[#F5F1E8]">
                Need immediate delivery changes or date rescheduling?
              </h4>
              <p className="text-xs text-[#F5F1E8]/60 font-light">
                Our logistics coordinators are available daily from 10 AM to 10 PM PKT.
              </p>
            </div>

            <a
              href={getWhatsAppConciergeUrl(
                `Salam, I am inquiring about tracking status for order #${result.order.order_number}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-[#0B0B0F] font-mono text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire via WhatsApp</span>
            </a>
          </div>

        </div>
      )}

      {/* Initial Help / Guide Section when no search has been run */}
      {!result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-[#0E0F14] border border-white/5 space-y-2 text-xs">
            <Clock className="w-5 h-5 text-[#C6A15B]" />
            <h4 className="font-serif text-sm text-[#F5F1E8] font-medium">Standard Timelines</h4>
            <p className="text-[#F5F1E8]/60 font-light leading-relaxed">
              Major cities (Karachi, Lahore, Islamabad) arrive in 2–3 working days. Regional cities in 3–4 working days.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0E0F14] border border-white/5 space-y-2 text-xs">
            <ShieldCheck className="w-5 h-5 text-[#C6A15B]" />
            <h4 className="font-serif text-sm text-[#F5F1E8] font-medium">Open-Parcel Check</h4>
            <p className="text-[#F5F1E8]/60 font-light leading-relaxed">
              Examine the sealed VELLORE packaging upon courier arrival prior to Cash on Delivery handover.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0E0F14] border border-white/5 space-y-2 text-xs">
            <RotateCcw className="w-5 h-5 text-[#C6A15B]" />
            <h4 className="font-serif text-sm text-[#F5F1E8] font-medium">7-Day Easy Returns</h4>
            <p className="text-[#F5F1E8]/60 font-light leading-relaxed">
              If dimensions or wrist presence require exchange, message our customer support team within 7 days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
