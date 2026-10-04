"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ProceduralWatch } from "./ProceduralWatch";
import * as THREE from "three";

interface StoryStep {
  id: string;
  title: string;
  category: string;
  description: string;
  cameraPos: [number, number, number];
  targetRotation: [number, number, number];
}

const STORY_STEPS: StoryStep[] = [
  {
    id: "dial",
    category: "Facet 01 // The Face",
    title: "Sunburst Obsidian & Applied Gold",
    description:
      "Crafted with deep layered lacquer, micro-grooved sunburst radiation, and hand-applied champagne gold indices that catch ambient light from every subtle wrist gesture.",
    cameraPos: [0, 0.4, 3.2],
    targetRotation: [0.65, 0, 0],
  },
  {
    id: "case",
    category: "Facet 02 // The Architecture",
    title: "316L Stainless & Fluted Bezel",
    description:
      "Sculpted from cold-forged 316L surgical steel, dual-finished with satin brushing along the flank and high-mirror polishing on the faceted bezel edge.",
    cameraPos: [1.6, 0.6, 3.4],
    targetRotation: [0.3, 0.95, -0.2],
  },
  {
    id: "strap",
    category: "Facet 03 // The Ergonomics",
    title: "Tuscan Leather & Signed Buckle",
    description:
      "Full-grain calfskin tanned in Florence using traditional vegetable methods. Supple from day one, molding seamlessly to your wrist with contrast wax stitching.",
    cameraPos: [0, -1.2, 3.6],
    targetRotation: [-0.4, 0.3, 0.2],
  },
  {
    id: "movement",
    category: "Facet 04 // The Engine",
    title: "High-Frequency Mecha-Calibre",
    description:
      "A harmonious fusion of mechanical chronograph gearing with quartz regulation for 1/5th second sweep accuracy and unwavering reliability.",
    cameraPos: [0, 0.8, 3.5],
    targetRotation: [Math.PI - 0.4, 0.2, 0],
  },
];

function ControlledWatchModel({ activeStep }: { activeStep: StoryStep }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        activeStep.targetRotation[0],
        3.5,
        delta
      );
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        activeStep.targetRotation[1],
        3.5,
        delta
      );
      groupRef.current.rotation.z = THREE.MathUtils.damp(
        groupRef.current.rotation.z,
        activeStep.targetRotation[2],
        3.5,
        delta
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <ProceduralWatch
        caseColor="#C6A15B"
        dialColor="#0B0B0F"
        strapColor="#2C1810"
        accentsColor="#C6A15B"
        scale={0.95}
        autoRotate={false}
        ticking={true}
      />
    </group>
  );
}

export function ScrollStoryScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const activeStep = STORY_STEPS[currentStepIndex];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-24 bg-[#0B0B0F] border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] tracking-[0.28em] uppercase text-[#C6A15B] font-medium">
            Anatomy of Perfection
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F1E8] tracking-tight">
            Every Angle, Considered.
          </h2>
          <p className="mt-3 text-sm text-[#F5F1E8]/60 font-light">
            Explore the architectural components defining the VELLORE horological benchmark.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 3D Viewport (7 Cols) */}
          <div className="lg:col-span-7 h-[400px] sm:h-[480px] rounded-3xl bg-[#16161D]/50 border border-white/10 relative overflow-hidden shadow-2xl">
            {isInView ? (
              <Canvas
                dpr={[1, 1.25]}
                frameloop={isInView ? "always" : "never"}
                camera={{ position: [0, 0.4, 3.8], fov: 40 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              >
                <ambientLight intensity={0.8} />
                <directionalLight position={[4, 5, 4]} intensity={2.0} color="#FFFFFF" />
                <directionalLight position={[-4, 2, -2]} intensity={2.2} color="#C6A15B" />
                <pointLight position={[0, -3, 2]} intensity={0.6} color="#1E3A5F" />

                <Suspense fallback={null}>
                  <ControlledWatchModel activeStep={activeStep} />
                </Suspense>
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#F5F1E8]/30 font-mono">
                [3D Stage Idle]
              </div>
            )}

            <div className="absolute top-4 left-4 pointer-events-none bg-[#0B0B0F]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C6A15B]">
                Interactive 3D Preview
              </span>
            </div>
          </div>

          {/* Interactive Narrative Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
            {STORY_STEPS.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`text-left p-6 rounded-2xl transition-all duration-300 border ${
                    isActive
                      ? "bg-[#16161D] border-[#C6A15B]/50 shadow-[0_0_30px_rgba(198,161,91,0.15)]"
                      : "bg-[#0E0F13]/40 border-white/5 hover:border-white/15 hover:bg-[#16161D]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-mono tracking-widest uppercase ${
                        isActive ? "text-[#C6A15B]" : "text-[#F5F1E8]/40"
                      }`}
                    >
                      {step.category}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isActive ? "bg-[#C6A15B] scale-125" : "bg-white/10"
                      }`}
                    />
                  </div>

                  <h3
                    className={`mt-2 font-serif text-lg sm:text-xl ${
                      isActive ? "text-[#F5F1E8]" : "text-[#F5F1E8]/70"
                    }`}
                  >
                    {step.title}
                  </h3>

                  {isActive && (
                    <p className="mt-2 text-xs sm:text-sm text-[#F5F1E8]/70 leading-relaxed font-light">
                      {step.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
