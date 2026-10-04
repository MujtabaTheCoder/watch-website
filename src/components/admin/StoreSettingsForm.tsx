"use client";

import React, { useState } from "react";
import { saveStoreSettingsAction } from "@/actions/admin";
import { StoreSettings } from "@/types";
import { Settings, Save, Check, Loader2, Store, Phone, Mail, Truck } from "lucide-react";

interface StoreSettingsFormProps {
  initialSettings: StoreSettings;
}

export function StoreSettingsForm({ initialSettings }: StoreSettingsFormProps) {
  const [storeName, setStoreName] = useState(initialSettings.store_name);
  const [tagline, setTagline] = useState(initialSettings.tagline);
  const [whatsapp, setWhatsapp] = useState(initialSettings.whatsapp_number);
  const [deliveryFee, setDeliveryFee] = useState(initialSettings.standard_delivery_fee.toString());
  const [threshold, setThreshold] = useState(initialSettings.free_delivery_threshold.toString());
  const [email, setEmail] = useState(initialSettings.support_email);
  const [phone, setPhone] = useState(initialSettings.support_phone);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      store_name: storeName,
      tagline,
      whatsapp_number: whatsapp,
      standard_delivery_fee: deliveryFee,
      free_delivery_threshold: threshold,
      support_email: email,
      support_phone: phone,
    };

    const res = await saveStoreSettingsAction(payload);
    if (res.success) {
      setStatusMessage("Store configurations updated & edge cache revalidated.");
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      alert("Failed to save settings: " + res.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          {statusMessage}
        </div>
      )}

      <div>
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C6A15B]">
          System Parameters
        </span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-serif text-[#F5F1E8]">
          Store Settings
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Information */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Store className="w-5 h-5 text-[#C6A15B]" />
            <h2 className="font-serif text-lg text-[#F5F1E8]">Maison Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>

            <div>
              <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Official Tagline</label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Support */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Phone className="w-5 h-5 text-[#25D366]" />
            <h2 className="font-serif text-lg text-[#F5F1E8]">Customer Support Coordinates</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#F5F1E8]/70 mb-1 font-mono">
                WhatsApp Hotline (+92XXXXXXXXXX)
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>

            <div>
              <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Support Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>
        </div>

        {/* Nationwide Courier & Delivery Rates */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Truck className="w-5 h-5 text-[#C6A15B]" />
            <h2 className="font-serif text-lg text-[#F5F1E8]">Logistics &amp; Courier Fees (PKR)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#F5F1E8]/70 mb-1 font-mono">
                Standard Shipping Charge (PKR)
              </label>
              <input
                type="number"
                required
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>

            <div>
              <label className="block text-[#F5F1E8]/70 mb-1 font-mono">
                Free Delivery Threshold (PKR)
              </label>
              <input
                type="number"
                required
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] text-[#0B0B0F] font-mono text-xs uppercase tracking-widest font-semibold flex items-center gap-2 shadow-lg transition-all"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
