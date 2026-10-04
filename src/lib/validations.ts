import { z } from "zod";

// Pakistani phone regex: allows 03001234567, 0300-1234567, +923001234567, 923001234567
export const pakistaniPhoneRegex = /^(?:(?:\+92|92)|0)?(3[0-9]{2})[ -]?[0-9]{7}$/;

export const checkoutSchema = z.object({
  customer_name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(80, "Full name is too long"),
  phone: z
    .string()
    .regex(pakistaniPhoneRegex, "Enter a valid Pakistani mobile number (e.g. 0300-1234567)"),
  city: z
    .string()
    .min(2, "City name is required")
    .max(50, "City name is too long"),
  address: z
    .string()
    .min(8, "Please enter your complete delivery address (House/Street/Area)")
    .max(300, "Address is too long"),
  notes: z.string().max(300).optional(),
  payment_method: z.enum(["COD", "BANK_TRANSFER", "JAZZCASH_EASYPAISA"]).default("COD"),
  // Honeypot field for bot spam detection: must remain empty
  website_hp: z.string().max(0, "Bot detected").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const productSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  discount_price: z.number().positive().nullable().optional(),
  category: z.string().min(2),
  images: z.array(z.string().url()).min(1),
  stock: z.number().int().nonnegative(),
  featured: z.boolean().default(false),
  specs: z.record(z.string(), z.string()).optional(),
  model_config: z
    .object({
      case_color: z.string(),
      dial_color: z.string(),
      strap_color: z.string(),
      accents: z.string(),
    })
    .optional(),
});

export function normalizePakistaniPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("923") && digits.length === 12) {
    return "0" + digits.slice(2);
  }
  if (digits.startsWith("3") && digits.length === 10) {
    return "0" + digits;
  }
  return digits;
}
