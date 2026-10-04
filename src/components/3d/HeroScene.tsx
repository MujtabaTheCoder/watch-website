"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import Link from "next/link";
import { ProceduralWatch } from "./ProceduralWatch";
import * as THREE from "three";

function FloatingWatchWithParallax() {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0.35, y: -0.4 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 0.6;
      const y = (e.clientY / innerHeight - 0.5) * 0.4;
      targetRotation.current = { x: 0.35 + y, y: -0.4 + x };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetRotation.current.x,
        3,
        delta
      );
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotation.current.y,
        3,
        delta
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.3}
        floatingRange={[-0.1, 0.1]}
      >
        <ProceduralWatch
          caseColor="#C6A15B"
          dialColor="#0B0B0F"
          strapColor="#2C1810"
          accentsColor="#C6A15B"
          scale={0.92}
          autoRotate={false}
          ticking={true}
        />
      </Float>
    </group>
  );
}

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Check reduced motion & WebGL
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    // Pause WebGL rendering whenever Hero is not in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
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
      className="relative w-full h-[92vh] min-h-[640px] flex items-center justify-center overflow-hidden bg-[#0B0B0F]"
    >
      {/* Background Ambience Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C6A15B]/10 rounded-full blur-[130px]" />
      </div>

      {/* 3D Canvas or Static Fallback */}
      <div className="absolute inset-0 z-0">
        {!prefersReducedMotion && hasWebGL ? (
          <Canvas
            dpr={[1, 1.25]}
            frameloop={isInView ? "always" : "never"}
            camera={{ position: [0, 0.4, 4.8], fov: 42 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
            }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[4, 5, 4]} intensity={2.0} color="#FFFFFF" />
            <directionalLight position={[-4, 2, -2]} intensity={2.2} color="#C6A15B" />
            <pointLight position={[0, -3, 2]} intensity={0.6} color="#1E3A5F" />

            <Suspense fallback={null}>
              <FloatingWatchWithParallax />
            </Suspense>
          </Canvas>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden border border-[#C6A15B]/30 shadow-[0_0_80px_rgba(198,161,91,0.2)]">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"
                alt="VELLORE Sovereign Masterpiece"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Hero Typography & Interactive Controls */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center flex flex-col items-center pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#16161D]/70 backdrop-blur-md text-[11px] tracking-[0.28em] text-[#C6A15B] uppercase font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-pulse" />
            Atelier Horlogerie • Pakistan
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-[#F5F1E8] tracking-tight leading-[1.05] max-w-4xl drop-shadow-2xl">
            TIME, REFINED.
          </h1>

          <p className="mt-5 text-sm sm:text-base md:text-lg text-[#F5F1E8]/70 max-w-xl font-light tracking-wide leading-relaxed">
            Meticulously engineered horology designed for the modern connoisseur.
            Complimentary insured delivery &amp; Cash on Delivery across Pakistan.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-3.5 rounded-full bg-[#C6A15B] text-[#0B0B0F] font-medium text-xs sm:text-sm tracking-[0.16em] uppercase hover:bg-[#dfc299] transition-all duration-300 shadow-[0_0_30px_rgba(198,161,91,0.35)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Explore Collection
            </Link>

            <Link
              href="/about"
              className="px-7 py-3.5 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-md text-[#F5F1E8] font-medium text-xs sm:text-sm tracking-[0.16em] uppercase hover:border-[#C6A15B]/50 hover:bg-white/[0.08] transition-all duration-300"
            >
              The Maison
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-60">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#F5F1E8]/60 font-light">
          Scroll to Discover
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#C6A15B] to-transparent animate-pulse" />
      </div>
    </section>
  );
}
