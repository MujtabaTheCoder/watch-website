"use client";

import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ProceduralWatch } from "./ProceduralWatch";
import { Watch3DConfig } from "@/types";
import { RotateCw } from "lucide-react";

interface ProductViewer3DProps {
  modelConfig?: Watch3DConfig;
  productName: string;
}

export function ProductViewer3D({ modelConfig, productName }: ProductViewer3DProps) {
  const [isRotating, setIsRotating] = useState(true);

  const caseColor = modelConfig?.case_color || "#C6A15B";
  const dialColor = modelConfig?.dial_color || "#0B0B0F";
  const strapColor = modelConfig?.strap_color || "#2C1810";
  const accentsColor = modelConfig?.accents || "#C6A15B";

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] bg-[#16161D]/40 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 0.4, 4.2], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          depth: true,
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 5, 4]} intensity={2.0} color="#FFFFFF" />
        <directionalLight position={[-4, 2, -2]} intensity={2.2} color={caseColor} />
        <pointLight position={[0, -3, 2]} intensity={0.6} color="#1E3A5F" />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <ProceduralWatch
              caseColor={caseColor}
              dialColor={dialColor}
              strapColor={strapColor}
              accentsColor={accentsColor}
              scale={0.95}
              autoRotate={false}
              ticking={true}
            />
          </group>
        </Suspense>

        <OrbitControls
          enableZoom={true}
          minDistance={2.6}
          maxDistance={5.5}
          enablePan={false}
          autoRotate={isRotating}
          autoRotateSpeed={0.9}
          maxPolarAngle={Math.PI / 1.6}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      {/* Floating Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-[#0B0B0F]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 pointer-events-auto flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-pulse" />
          <span className="text-[11px] text-[#F5F1E8]/70 tracking-wider">
            Drag to Rotate &bull; Scroll to Zoom
          </span>
        </div>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className="bg-[#0B0B0F]/80 hover:bg-[#16161D] backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 pointer-events-auto flex items-center gap-1.5 text-[11px] text-[#F5F1E8]/80 hover:text-[#C6A15B] transition-colors"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} />
          {isRotating ? "Pause Spin" : "Auto Spin"}
        </button>
      </div>
    </div>
  );
}
