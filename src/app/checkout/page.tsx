"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { processCheckoutAction } from "@/actions/checkout";
import { formatPKR } from "@/lib/format";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building,
  Smartphone,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  // Client-generated UUID idempotency key (generated once per checkout session)
  const [idempotencyKey, setIdempotencyKey] = useState("");
  useEffect(() => {
    // Generate UUID v4
    if (typeof window !== "undefined") {
      const generated = "vellore-" + crypto.randomUUID();
      setIdempotencyKey(generated);
    }
  }, []);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [websiteHp, setWebsiteHp] = useState(""); // Honeypot bot trap

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (items.length === 0) {
      setErrorMessage("Your shopping bag is empty.");
      return;
    }

    if (!idempotencyKey) {
      setErrorMessage("Session expired. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      }));

      const result = await processCheckoutAction(
        {
          customer_name: customerName,
          phone,
          city,
          address,
          notes,
          payment_method: paymentMethod,
          website_hp: websiteHp,
          idempotency_key: idempotencyKey,
        },
        itemsPayload
      );

      if (!result.success || !result.order_number) {
        setErrorMessage(
          result.error || "Failed to confirm your order. Please review your details and retry."
        );
        setIsSubmitting(false);
        return;
      }

      // Order created successfully! Clear the cart and navigate to success screen
      clearCart();
      router.push(`/order-success/${result.order_number}`);
    } catch (err) {
      setErrorMessage("Network issue encountered. Your cart is intact. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20 bg-[#0B0B0F]">
        <h1 className="text-2xl font-serif text-[#F5F1E8]">No Items to Checkout</h1>
        <p className="mt-2 text-xs text-[#F5F1E8]/50">
          Please add a watch to your bag before proceeding to checkout.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="mt-6 px-6 py-2.5 rounded-full bg-[#C6A15B] text-[#0B0B0F] text-xs uppercase tracking-widest font-medium"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#C6A15B] font-mono">
            Encrypted Order Gateway
          </span>
          <h1 className="mt-2 text-3xl font-serif text-[#F5F1E8]">Guest Checkout</h1>
          <p className="mt-2 text-xs text-[#F5F1E8]/50">
            No account needed. Provide delivery coordinates for priority dispatch.
          </p>
        </div>

        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Delivery & Payment Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Delivery Information Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                  <Truck className="w-5 h-5 text-[#C6A15B]" />
                  <h2 className="font-serif text-lg text-[#F5F1E8]">Delivery Destination</h2>
                </div>

                {/* Honeypot field (hidden from real users, filled by spam bots) */}
                <input
                  type="text"
                  name="website_hp"
                  value={websiteHp}
                  onChange={(e) => setWebsiteHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#F5F1E8]/70 mb-1.5 font-medium">
                      Full Name <span className="text-[#C6A15B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mansoor"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#F5F1E8]/70 mb-1.5 font-medium">
                        Mobile Phone (03XX-XXXXXXX) <span className="text-[#C6A15B]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0300-1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B]"
                      />
                      <span className="text-[10px] text-[#F5F1E8]/40 mt-1 block">
                        We will send dispatch confirmation via WhatsApp/SMS
                      </span>
                    </div>

                    <div>
                      <label className="block text-[#F5F1E8]/70 mb-1.5 font-medium">
                        City / Destination <span className="text-[#C6A15B]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Lahore, Karachi, Islamabad..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#F5F1E8]/70 mb-1.5 font-medium">
                      Complete Street Address <span className="text-[#C6A15B]">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="House/Apartment #, Street, Phase/Sector, Area Landmark"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#F5F1E8]/70 mb-1.5 font-medium">
                      Special Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Please call before arriving or deliver after 2 PM"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-5">
                <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                  <CreditCard className="w-5 h-5 text-[#C6A15B]" />
                  <h2 className="font-serif text-lg text-[#F5F1E8]">Payment Selection</h2>
                </div>

                <div className="space-y-3">
                  {/* COD (Default) */}
                  <label
                    className={`block p-4 rounded-2xl border cursor-pointer transition-colors ${
                      paymentMethod === "COD"
                        ? "bg-[#181B24] border-[#C6A15B] shadow-md"
                        : "bg-[#0E0F13] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="accent-[#C6A15B] w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-[#F5F1E8]">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C6A15B]/20 text-[#C6A15B]">
                            Recommended
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#F5F1E8]/60 font-light">
                          Pay in cash directly to the courier upon delivery at your doorstep. Open parcel inspection supported.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label
                    className={`block p-4 rounded-2xl border cursor-pointer transition-colors ${
                      paymentMethod === "BANK_TRANSFER"
                        ? "bg-[#181B24] border-[#C6A15B] shadow-md"
                        : "bg-[#0E0F13] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value="BANK_TRANSFER"
                        checked={paymentMethod === "BANK_TRANSFER"}
                        onChange={() => setPaymentMethod("BANK_TRANSFER")}
                        className="accent-[#C6A15B] w-4 h-4"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-sm text-[#F5F1E8]">
                          Direct Bank Transfer (Meezan / HBL / Alfalah)
                        </span>
                        <p className="mt-1 text-xs text-[#F5F1E8]/60 font-light">
                          Account details will be presented upon order placement; send screenshot via WhatsApp for instant release.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* JazzCash / Easypaisa */}
                  <label
                    className={`block p-4 rounded-2xl border cursor-pointer transition-colors ${
                      paymentMethod === "JAZZCASH_EASYPAISA"
                        ? "bg-[#181B24] border-[#C6A15B] shadow-md"
                        : "bg-[#0E0F13] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value="JAZZCASH_EASYPAISA"
                        checked={paymentMethod === "JAZZCASH_EASYPAISA"}
                        onChange={() => setPaymentMethod("JAZZCASH_EASYPAISA")}
                        className="accent-[#C6A15B] w-4 h-4"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-sm text-[#F5F1E8]">
                          JazzCash / Easypaisa Mobile Wallet
                        </span>
                        <p className="mt-1 text-xs text-[#F5F1E8]/60 font-light">
                          Fast mobile wallet transfer. Immediate courier priority dispatch upon receipt.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Review & Confirmation (5 Cols) */}
            <div className="lg:col-span-5 rounded-3xl bg-[#14151B] border border-white/10 p-6 sm:p-8 space-y-6">
              <h2 className="font-serif text-xl text-[#F5F1E8] pb-4 border-b border-white/10">
                Order Review
              </h2>

              {/* Items Summary list */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => {
                  const activePrice = item.product.discount_price ?? item.product.price;
                  const img = item.product.images[0] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80";

                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 pb-3 border-b border-white/5"
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                        <Image
                          src={img}
                          alt={item.product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-[#F5F1E8] truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] font-mono text-[#F5F1E8]/60">
                          Qty: {item.quantity} &times; {formatPKR(activePrice)}
                        </div>
                      </div>
                      <div className="font-mono text-xs text-[#F5F1E8]">
                        {formatPKR(activePrice * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calculations */}
              <div className="space-y-2.5 text-xs text-[#F5F1E8]/70 pt-2 border-t border-white/10">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#F5F1E8]">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier &amp; Insurance</span>
                  <span className="font-mono text-[#F5F1E8]">
                    {deliveryFee === 0 ? (
                      <span className="text-[#C6A15B]">FREE</span>
                    ) : (
                      formatPKR(deliveryFee)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between text-base font-medium text-[#F5F1E8]">
                  <span>Total Payable (PKR)</span>
                  <span className="font-mono text-xl text-[#C6A15B] font-semibold">
                    {formatPKR(total)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] disabled:opacity-50 text-[#0B0B0F] font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(198,161,91,0.3)] hover:shadow-[0_0_35px_rgba(198,161,91,0.5)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Complete Order &bull; {formatPKR(total)}</span>
                  </>
                )}
              </button>

              <div className="space-y-2 pt-2 text-[11px] text-[#F5F1E8]/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
                  <span>Idempotency guaranteed &bull; Double-click safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C6A15B]" />
                  <span>2-4 Business Days delivery across Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
