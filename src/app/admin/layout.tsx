"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
  Users,
  Layers,
  Radio,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logoutAdminAction } from "@/actions/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // If on /admin/login, don't wrap with dashboard chrome
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAdminEmail(data.user.email || "Staff Admin");
      } else {
        setAdminEmail("Staff Operations");
      }
    });
  }, [isLoginPage]);

  const handleSignOut = async () => {
    document.cookie = "vellore-admin-session=; path=/; max-age=0";
    document.cookie = "vellore-admin-demo=; path=/; max-age=0";
    await logoutAdminAction();
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Customers", href: "/admin/orders", icon: Users },
    { label: "Inventory", href: "/admin/products", icon: Layers },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-[#F5F1E8] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-white/10 bg-[#0E0F13] p-6 z-20">
        <div className="space-y-8">
          {/* Brand Wordmark */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#C6A15B]" />
              <span className="font-serif text-xl tracking-[0.25em] text-[#F5F1E8]">
                VELLORE
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B] block pl-7">
              Maison Portal
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-colors ${
                    isActive
                      ? "bg-[#C6A15B]/15 text-[#C6A15B] border border-[#C6A15B]/30 font-medium"
                      : "text-[#F5F1E8]/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Session & Logout */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-[#F5F1E8]/60">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="truncate">{adminEmail || "Authenticated"}</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-[#F5F1E8]/50 hover:text-[#C6A15B] transition-colors py-1"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 text-xs text-red-400/80 hover:text-red-400 transition-colors py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0E0F13] border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C6A15B]" />
            <span className="font-serif text-lg tracking-widest text-[#F5F1E8]">VELLORE</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#F5F1E8]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0E0F13] border-b border-white/10 p-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 text-xs font-mono uppercase text-[#F5F1E8]"
              >
                <item.icon className="w-4 h-4 text-[#C6A15B]" />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <Link href="/" target="_blank" className="text-xs text-[#C6A15B]">
                View Store
              </Link>
              <button onClick={handleSignOut} className="text-xs text-red-400">
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main Route Content */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
