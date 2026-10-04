"use client";

import React, { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { ProceduralWatch } from "@/components/3d/ProceduralWatch";
import { ArrowRight, Box, Shield } from "lucide-react";

export function HeroTimeArchitecture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[90vh] flex flex-col justify-between pt-6 pb-10 bg-[#070709] text-[#F5F1E8] overflow-hidden border-b border-white/[0.06]"
    >
      {/* High-speed CSS Radial Gradient (replaces heavy Gaussian blur filter for 60-120 FPS performance) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 38%, rgba(198,161,91,0.07) 0%, rgba(7,7,9,0) 65%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 space-y-6">
        {/* Top Header Row: Title on Left, Chronometer Badge on Right */}
        {/* Top Header Row: Title on Left, Trust Badge on Right */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pt-2">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] uppercase text-[#C6A15B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-pulse" />
              VELLORE HOROLOGY • PAKISTAN
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif tracking-tight leading-[1.08]">
              <span className="text-[#F5F1E8] font-normal">Time,</span>{" "}
              <span className="italic font-light text-[#C6A15B]">worn beautifully.</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#F5F1E8]/75 font-light leading-relaxed pt-1">
              Discover watches designed to sit quietly on your wrist and speak loudly about your taste. Minimal, elegant, made to be noticed.
            </p>
          </div>

          {/* Right Trust Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#101116] border border-[#C6A15B]/25 max-w-sm flex items-start gap-3 shadow-xl">
            <div className="p-2 rounded-xl bg-[#C6A15B]/15 text-[#C6A15B] flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B] block font-semibold">
                VELLORE PROMISE
              </span>
              <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
                Free delivery across Pakistan, Cash on Delivery, and 7-day easy returns on all timepieces.
              </p>
            </div>
          </div>
        </div>

        {/* Center 3D Stage with Celestial Orbital Astrolabe Rings */}
        <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] rounded-3xl bg-[#0B0C10] border border-white/[0.08] overflow-hidden flex items-center justify-center shadow-2xl">
          {/* Orbital Celestial Constellation Background SVG */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <svg
              className="w-[480px] h-[480px] sm:w-[650px] sm:h-[650px] animate-[spin_180s_linear_infinite]"
              viewBox="0 0 600 600"
              fill="none"
            >
              <circle
                cx="300"
                cy="300"
                r="280"
                stroke="#C6A15B"
                strokeWidth="0.8"
                strokeDasharray="4 8"
                opacity="0.35"
              />
              <circle
                cx="300"
                cy="300"
                r="220"
                stroke="#C6A15B"
                strokeWidth="1.2"
                opacity="0.45"
              />
              <circle
                cx="300"
                cy="300"
                r="160"
                stroke="#C6A15B"
                strokeWidth="0.9"
                strokeDasharray="2 10"
                opacity="0.5"
              />
              {Array.from({ length: 24 }).map((_, i) => (
                <line
                  key={i}
                  x1="300"
                  y1="25"
                  x2="300"
                  y2="38"
                  stroke="#C6A15B"
                  strokeWidth="1.2"
                  opacity="0.4"
                  transform={`rotate(${i * 15} 300 300)`}
                />
              ))}
            </svg>
          </div>

          {/* Top-Left Stage Badge */}
          <div className="absolute top-5 left-5 z-20 pointer-events-none bg-[#070709] px-3.5 py-1.5 rounded-full border border-white/10">
            <span className="text-[9.5px] sm:text-[10px] font-mono tracking-widest uppercase text-[#C6A15B]">
              43.5MM TITANIUM 904L &bull; 71-DAY RESERVE
            </span>
          </div>

          {/* Bottom-Right Stage Badge */}
          <div className="absolute bottom-5 right-5 z-20 pointer-events-none bg-[#070709] px-3.5 py-1.5 rounded-full border border-white/10">
            <span className="text-[9.5px] sm:text-[10px] font-mono tracking-widest uppercase text-[#F5F1E8]/75">
              &bull; TITANIUM BEZEL / CHRONO RESET
            </span>
          </div>

          {/* Bottom-Center Interactive Hint */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-[#121319] px-4 py-1.5 rounded-full border border-[#C6A15B]/30 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-pulse" />
            <span className="text-[9.5px] sm:text-[10px] font-mono tracking-widest uppercase text-[#C6A15B]">
              &bull; ROTATION: ACTIVE (DRAG) &bull;
            </span>
          </div>

          {/* High-Performance WebGL Canvas (1x DPR, paused offscreen for 0 background load) */}
          {hasWebGL ? (
            <Canvas
              dpr={1}
              frameloop={isInView ? "always" : "never"}
              camera={{ position: [0, 0.35, 4.2], fov: 38 }}
              gl={{
                antialias: false,
                alpha: true,
                powerPreference: "high-performance",
                stencil: false,
                depth: true,
              }}
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[4, 5, 4]} intensity={2.0} color="#FFFFFF" />
              <directionalLight position={[-4, 2, -2]} intensity={2.2} color="#C6A15B" />

              <Suspense fallback={null}>
                <Float
                  speed={1.2}
                  rotationIntensity={0.08}
                  floatIntensity={0.15}
                  floatingRange={[-0.05, 0.05]}
                >
                  <group rotation={[0.25, -0.35, 0]}>
                    <ProceduralWatch
                      caseColor="#C6A15B"
                      dialColor="#08080B"
                      strapColor="#14151B"
                      accentsColor="#C6A15B"
                      scale={0.96}
                      autoRotate={true}
                      ticking={true}
                    />
                  </group>
                </Float>
              </Suspense>

              <OrbitControls
                enableZoom={false}
                enablePan={false}
                maxPolarAngle={Math.PI / 1.5}
                minPolarAngle={Math.PI / 3.5}
              />
            </Canvas>
          ) : (
            <div className="relative w-80 h-80 rounded-full overflow-hidden border border-[#C6A15B]/40">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"
                alt="NOCTURNE Master Calibre"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Hero CTA Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          <Link
            href="/shop"
            className="px-8 py-3.5 rounded-full bg-[#C6A15B] hover:bg-[#dfc299] text-[#08080A] font-semibold text-xs sm:text-sm tracking-[0.16em] uppercase flex items-center gap-2.5 transition-all shadow-[0_0_20px_rgba(198,161,91,0.35)] hover:-translate-y-0.5 active:translate-y-0 font-mono"
          >
            <span>SHOP THE COLLECTION</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/shop?category=Luxe"
            className="px-7 py-3.5 rounded-full border border-[#C6A15B]/40 bg-[#121319] text-[#F5F1E8] hover:text-[#C6A15B] hover:border-[#C6A15B] font-medium text-xs sm:text-sm tracking-[0.16em] uppercase flex items-center gap-2.5 transition-all font-mono"
          >
            <Box className="w-4 h-4 text-[#C6A15B]" />
            <span>EXPLORE BESTSELLERS</span>
          </Link>
        </div>

        {/* Trust strip */}
        <div className="pt-6 border-t border-white/[0.06]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#0F1015] border border-white/[0.06] space-y-1">
              <span className="text-[10px] text-[#C6A15B] uppercase block tracking-wider font-semibold">
                NATIONWIDE
              </span>
              <span className="text-[#F5F1E8]/90 text-[11px] block font-medium">
                Free delivery across Pakistan
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F1015] border border-white/[0.06] space-y-1">
              <span className="text-[10px] text-[#C6A15B] uppercase block tracking-wider font-semibold">
                PAYMENT
              </span>
              <span className="text-[#F5F1E8]/90 text-[11px] block font-medium">
                Cash on Delivery available
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F1015] border border-white/[0.06] space-y-1">
              <span className="text-[10px] text-[#C6A15B] uppercase block tracking-wider font-semibold">
                ASSURANCE
              </span>
              <span className="text-[#F5F1E8]/90 text-[11px] block font-medium">
                7-day easy returns
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F1015] border border-white/[0.06] space-y-1">
              <span className="text-[10px] text-[#C6A15B] uppercase block tracking-wider font-semibold">
                SECURITY
              </span>
              <span className="text-[#F5F1E8]/90 text-[11px] block font-medium">
                Secure checkout
              </span>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono text-[#F5F1E8]/60 bg-[#121319] border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              TODAY&apos;S DISPATCH: Ready to Leave at 07:00 PM
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
