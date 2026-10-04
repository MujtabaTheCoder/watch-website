"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { loginAdminWithCredentialsAction } from "@/actions/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!username.trim() || !password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginAdminWithCredentialsAction({
        username,
        password,
      });

      if (!result.success) {
        setErrorMsg(result.error || "Authentication failed. Invalid username or password.");
        setIsSubmitting(false);
        return;
      }

      setInfoMsg("Identity verified. Accessing operations portal...");
      router.push("/admin");
    } catch {
      setErrorMsg("An unexpected connection error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center p-6 selection:bg-[#C6A15B] selection:text-[#070709]">
      <div className="max-w-md w-full rounded-3xl bg-[#0E0F13] border border-white/10 p-8 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-[#C6A15B]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#14151B] border border-white/10 flex items-center justify-center text-[#C6A15B] mb-4 shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-serif text-2xl tracking-[0.28em] text-[#F5F1E8] block uppercase">
            VELLORE
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B] block font-semibold">
            Maison Administrative Gateway
          </span>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Username & Password Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#F5F1E8]/70 mb-1.5 font-mono">
              Username or Administrator Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#F5F1E8]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#14151B] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#F5F1E8]/70 mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#F5F1E8]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#14151B] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#C6A15B] hover:bg-[#dfc299] disabled:opacity-50 text-[#0B0B0F] font-mono text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all shadow-md mt-6"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Authenticate &amp; Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Credentials Helper Badge */}
        <div className="p-3.5 rounded-2xl bg-[#14151B] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[#C6A15B] font-mono text-[10px] uppercase font-semibold">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Portal Access Credentials
            </span>
            <button
              type="button"
              onClick={() => {
                setUsername("admin");
                setPassword("admin123");
              }}
              className="text-[10px] text-[#C6A15B] hover:underline"
            >
              Fill Credentials
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-[#F5F1E8]/70 pt-1 border-t border-white/5">
            <div>
              <span className="text-[#F5F1E8]/40 block text-[9px] uppercase">Username</span>
              <span className="text-[#F5F1E8] font-bold">admin</span>
            </div>
            <div>
              <span className="text-[#F5F1E8]/40 block text-[9px] uppercase">Password</span>
              <span className="text-[#F5F1E8] font-bold">admin123</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-white/5">
          <Link
            href="/"
            className="text-[11px] text-[#F5F1E8]/40 hover:text-[#C6A15B] transition-colors font-mono"
          >
            &larr; Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
