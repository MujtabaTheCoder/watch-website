// ============================================================================
// VELLORE — Formatting & Localization Utilities
// Currency: PKR ("Rs. 12,500")
// WhatsApp Concierge Generator
// ============================================================================

export function formatPKR(amount: number): string {
  if (isNaN(amount)) return "Rs. 0";
  const formatted = Math.round(amount).toLocaleString("en-PK");
  return `Rs. ${formatted}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function getWhatsAppOrderUrl(params: {
  phone?: string;
  orderNumber: string;
  customerName: string;
  total: number;
}): string {
  const targetPhone = params.phone ? params.phone.replace(/\D/g, "") : "923001234567";
  const internationalPhone = targetPhone.startsWith("0")
    ? "92" + targetPhone.slice(1)
    : targetPhone.startsWith("92")
    ? targetPhone
    : "92" + targetPhone;

  const message = `Salam! This is regarding order #${params.orderNumber} placed at VELLORE for ${params.customerName}. Total: ${formatPKR(
    params.total
  )}. We are preparing your shipment.`;

  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppConciergeUrl(customQuery?: string): string {
  const basePhone = "923001234567";
  const defaultMsg = customQuery
    ? `Salam VELLORE Support, I have an inquiry regarding: ${customQuery}`
    : "Salam VELLORE, I would like to know more about your watch collection.";
  return `https://wa.me/${basePhone}?text=${encodeURIComponent(defaultMsg)}`;
}
