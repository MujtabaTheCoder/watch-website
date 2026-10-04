import React from "react";
import { MessageCircle, Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { getWhatsAppConciergeUrl } from "@/lib/format";

export const metadata = {
  title: "Client Care & Inquiries | VELLORE",
  description: "Connect with the VELLORE team via direct WhatsApp chat, telephone, or email.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] py-16">
      <div className="max-w-4xl mx-auto px-6 space-y-14">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-[#C6A15B]">
            Client Relations
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-serif text-[#F5F1E8]">
            Customer Support &amp; Care
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#F5F1E8]/60 font-light">
            Whether inquiring about movement specifications, personalized wrist sizing, or delivery status, our watch specialists are at your service.
          </p>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* WhatsApp Direct (Recommended) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#141C16] to-[#0F1410] border border-[#25D366]/30 space-y-5 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#25D366]">
                Fastest Response &bull; 10 AM – 10 PM PKT
              </span>
              <h2 className="font-serif text-2xl text-[#F5F1E8]">WhatsApp Instant Chat</h2>
              <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
                Connect directly with our master watchmakers and logistics coordinators.
                Live wrist-shot videos and immediate sizing advice.
              </p>
            </div>

            <a
              href={getWhatsAppConciergeUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-[#0B0B0F] font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <span>Initiate WhatsApp Chat</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Traditional Channels */}
          <div className="p-8 rounded-3xl bg-[#14151B] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <h2 className="font-serif text-2xl text-[#F5F1E8]">Contact Details</h2>

              <div className="space-y-4 text-xs text-[#F5F1E8]/70">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#C6A15B] mt-0.5" />
                  <div>
                    <strong className="text-[#F5F1E8] block">Telephone Helpline:</strong>
                    <span>+92 300 1234567</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C6A15B] mt-0.5" />
                  <div>
                    <strong className="text-[#F5F1E8] block">Electronic Mail:</strong>
                    <span>concierge@vellore.pk</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#C6A15B] mt-0.5" />
                  <div>
                    <strong className="text-[#F5F1E8] block">Operational Hours:</strong>
                    <span>Monday through Saturday, 10:00 AM – 10:00 PM (PKT)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C6A15B] mt-0.5" />
                  <div>
                    <strong className="text-[#F5F1E8] block">Nationwide Delivery &amp; Support:</strong>
                    <span>Direct insured courier dispatch across all cities in Pakistan</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-[11px] text-[#F5F1E8]/40">
              Dispatches executed via armored couriers across all provinces.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
