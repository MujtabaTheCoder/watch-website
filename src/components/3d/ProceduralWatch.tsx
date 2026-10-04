"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Watch3DProps {
  caseColor?: string;
  dialColor?: string;
  strapColor?: string;
  accentsColor?: string;
  scale?: number;
  autoRotate?: boolean;
  ticking?: boolean;
}

export function ProceduralWatch({
  caseColor = "#C6A15B",
  dialColor = "#0A0B0E",
  strapColor = "#14151B",
  accentsColor = "#C6A15B",
  scale = 1,
  autoRotate = true,
  ticking = true,
}: Watch3DProps) {
  const watchGroupRef = useRef<THREE.Group>(null);
  const secondHandRef = useRef<THREE.Mesh>(null);
  const minuteHandRef = useRef<THREE.Mesh>(null);
  const hourHandRef = useRef<THREE.Mesh>(null);

  // Cached materials for optimal draw calls and fill-rate
  const materials = useMemo(() => {
    return {
      caseMat: new THREE.MeshStandardMaterial({
        color: caseColor,
        metalness: 0.85,
        roughness: 0.25,
      }),
      dialMat: new THREE.MeshStandardMaterial({
        color: dialColor,
        roughness: 0.5,
        metalness: 0.1,
      }),
      markerMat: new THREE.MeshStandardMaterial({
        color: accentsColor,
        metalness: 0.9,
        roughness: 0.2,
      }),
      strapMat: new THREE.MeshStandardMaterial({
        color: strapColor,
        roughness: 0.85,
        metalness: 0.05,
      }),
    };
  }, [caseColor, dialColor, strapColor, accentsColor]);

  // Pre-calculated hour markers (12 positions, combined geometry for 0 runtime allocation)
  const hourMarkers = useMemo(() => {
    const markers = [];
    const radius = 1.32;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const x = Math.sin(angle) * radius;
      const y = Math.cos(angle) * radius;
      const isQuarter = i % 3 === 0;
      markers.push({
        position: [x, y, 0.16] as [number, number, number],
        rotation: [0, 0, -angle] as [number, number, number],
        scale: isQuarter
          ? ([0.06, 0.22, 0.02] as [number, number, number])
          : ([0.035, 0.14, 0.015] as [number, number, number]),
      });
    }
    return markers;
  }, []);

  // Frame update using clock elapsed time (0 garbage collection / 0 object allocations)
  useFrame((state, delta) => {
    if (autoRotate && watchGroupRef.current) {
      watchGroupRef.current.rotation.y += delta * 0.2;
    }

    if (ticking) {
      const elapsed = state.clock.getElapsedTime();
      if (secondHandRef.current) {
        secondHandRef.current.rotation.z = -((elapsed % 60) / 60) * Math.PI * 2;
      }
      if (minuteHandRef.current) {
        minuteHandRef.current.rotation.z = -((elapsed / 60) % 60 / 60) * Math.PI * 2;
      }
      if (hourHandRef.current) {
        hourHandRef.current.rotation.z = -((elapsed / 3600) % 12 / 12) * Math.PI * 2;
      }
    }
  });

  return (
    <group ref={watchGroupRef} scale={scale} dispose={null}>
      {/* 1. Main Watch Case Body (Lugs & Cylinder, 24 segments) */}
      <mesh material={materials.caseMat} position={[0, 0, 0]}>
        <cylinderGeometry args={[1.75, 1.82, 0.36, 24]} />
      </mesh>

      {/* 2. Stepped Bezel */}
      <mesh material={materials.caseMat} position={[0, 0.19, 0]}>
        <cylinderGeometry args={[1.68, 1.76, 0.1, 24]} />
      </mesh>

      {/* 3. Outer Fluted Accent Ring */}
      <mesh material={materials.markerMat} position={[0, 0.22, 0]}>
        <torusGeometry args={[1.62, 0.03, 8, 24]} />
      </mesh>

      {/* 4. Dial Face */}
      <mesh material={materials.dialMat} position={[0, 0.21, 0]}>
        <cylinderGeometry args={[1.56, 1.56, 0.03, 24]} />
      </mesh>

      {/* 5. Radial Hour Markers */}
      <group position={[0, 0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {hourMarkers.map((m, index) => (
          <mesh
            key={index}
            position={m.position}
            rotation={m.rotation}
            material={materials.markerMat}
          >
            <boxGeometry args={m.scale} />
          </mesh>
        ))}
      </group>

      {/* 6. Hands System */}
      <group position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Center Pivot Pin */}
        <mesh material={materials.markerMat} position={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
        </mesh>

        {/* Hour Hand */}
        <group ref={hourHandRef}>
          <mesh material={materials.markerMat} position={[0, 0.38, 0.02]}>
            <boxGeometry args={[0.07, 0.75, 0.02]} />
          </mesh>
        </group>

        {/* Minute Hand */}
        <group ref={minuteHandRef}>
          <mesh material={materials.markerMat} position={[0, 0.58, 0.04]}>
            <boxGeometry args={[0.05, 1.15, 0.02]} />
          </mesh>
        </group>

        {/* Second Hand */}
        <group ref={secondHandRef}>
          <mesh material={materials.markerMat} position={[0, 0.65, 0.06]}>
            <boxGeometry args={[0.02, 1.3, 0.015]} />
          </mesh>
        </group>
      </group>

      {/* 7. Crown */}
      <group position={[1.84, 0.05, 0]}>
        <mesh material={materials.caseMat} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.2, 0.22, 12]} />
        </mesh>
      </group>

      {/* 8. Straps */}
      <group position={[0, 0, -2.35]}>
        <mesh material={materials.strapMat} position={[0, -0.12, 0.3]} rotation={[-0.18, 0, 0]}>
          <boxGeometry args={[1.35, 0.14, 1.45]} />
        </mesh>
        <mesh material={materials.strapMat} position={[0, -0.4, -0.65]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[1.3, 0.13, 1.25]} />
        </mesh>
      </group>

      <group position={[0, 0, 2.35]}>
        <mesh material={materials.strapMat} position={[0, -0.12, -0.3]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[1.35, 0.14, 1.45]} />
        </mesh>
        <mesh material={materials.strapMat} position={[0, -0.4, 0.65]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[1.3, 0.13, 1.25]} />
        </mesh>
        <mesh material={materials.caseMat} position={[0, -0.62, 1.2]}>
          <boxGeometry args={[1.35, 0.18, 0.18]} />
        </mesh>
      </group>
    </group>
  );
}
