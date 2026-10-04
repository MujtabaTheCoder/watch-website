import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SupportedCurrency = "PKR" | "USD" | "EUR" | "GBP" | "CHF" | "AED";

export const CURRENCY_RATES: Record<SupportedCurrency, { rate: number; symbol: string; prefix: string; label: string }> = {
  PKR: { rate: 278.5, symbol: "PKR", prefix: "PKR ", label: "PKR (Rs.) — Pakistani Rupee" },
  USD: { rate: 1.0, symbol: "$", prefix: "$", label: "USD ($) — US Dollar" },
  EUR: { rate: 0.92, symbol: "€", prefix: "€", label: "EUR (€) — Euro" },
  GBP: { rate: 0.78, symbol: "£", prefix: "£", label: "GBP (£) — British Pound" },
  CHF: { rate: 0.88, symbol: "CHF", prefix: "CHF ", label: "CHF (CHF) — Swiss Franc" },
  AED: { rate: 3.67, symbol: "AED", prefix: "AED ", label: "AED (AED) — UAE Dirham" },
};

export function formatPrice(cents: number, currency: SupportedCurrency = "PKR"): string {
  const currencyInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
  const convertedAmount = (cents / 100) * currencyInfo.rate;
  
  if (currency === "PKR") {
    return `PKR ${Math.round(convertedAmount).toLocaleString("en-PK")}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(convertedAmount);
}

export const formatCurrency = formatPrice;

