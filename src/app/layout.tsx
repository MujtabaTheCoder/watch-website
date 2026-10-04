import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/footer/Footer";
import { CartDrawer } from "@/components/navigation/CartDrawer";
import { AddToCartNotification } from "@/components/navigation/AddToCartNotification";
import { LiveSearchModal } from "@/components/navigation/LiveSearchModal";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { SmoothScroll } from "@/components/ui/SmoothScroll";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VELLORE | Aesthetic Watches in Pakistan",
  description:
    "Shop elegant, minimal and luxe watches online at VELLORE. Free delivery, Cash on Delivery, and easy returns across Pakistan.",
  keywords: [
    "VELLORE",
    "aesthetic watches Pakistan",
    "watches Pakistan",
    "minimalist watches",
    "luxury watches Pakistan",
    "COD watches Pakistan",
    "Cash on Delivery watches Pakistan",
    "classic watches",
    "sports watches",
  ],
  openGraph: {
    title: "VELLORE | Aesthetic Watches in Pakistan",
    description:
      "Shop elegant, minimal and luxe watches online at VELLORE. Free delivery, Cash on Delivery, and easy returns across Pakistan.",
    siteName: "VELLORE",
    locale: "en_PK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} dark`}>
      <body className="bg-[#070709] text-[#F5F1E8] font-sans antialiased selection:bg-[#C6A15B] selection:text-[#070709]">
        <SmoothScroll>
          <CustomCursor />
          <Navbar />
          <CartDrawer />
          <AddToCartNotification />
          <LiveSearchModal />
          <main className="min-h-screen pt-16 sm:pt-20">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
