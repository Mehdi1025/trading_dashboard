"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Stars } from "@react-three/drei";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface DotGlobeHeroProps {
  rotationSpeed?: number;
  globeRadius?: number;
  className?: string;
  children?: React.ReactNode;
}

function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }

  return positions;
}

const Globe: React.FC<{ rotationSpeed: number; radius: number }> = ({
  rotationSpeed,
  radius,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const dotPositions = useMemo(() => fibonacciSphere(1200, radius), [radius]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
      groupRef.current.rotation.x += rotationSpeed * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dotPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#34d399"
          size={0.015}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <mesh>
        <sphereGeometry args={[radius * 1.02, 48, 48]} />
        <meshBasicMaterial
          color="#34d399"
          transparent
          opacity={0.06}
          wireframe
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.35, 0.002, 8, 128]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#060a0e]" />
      <div className="absolute -left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
      <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-indigo-500/[0.06] blur-[100px]" />
      <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-teal-500/[0.05] blur-[90px]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 45%, black 15%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060a0e]/20 via-transparent to-[#060a0e]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#060a0e_72%)]" />
    </div>
  );
}

const DotGlobeHero = React.forwardRef<HTMLDivElement, DotGlobeHeroProps>(
  (
    { rotationSpeed = 0.005, globeRadius = 1, className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-screen w-full overflow-hidden bg-[#060a0e]",
          className,
        )}
        {...props}
      >
        <HeroBackdrop />

        <div className="pointer-events-none absolute inset-0 z-[1] opacity-80">
          <Canvas gl={{ antialias: true, alpha: true }}>
            <PerspectiveCamera makeDefault position={[0, 0, 3.2]} fov={70} />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <Stars
              radius={80}
              depth={40}
              count={1800}
              factor={3}
              saturation={0}
              fade
              speed={0.4}
            />
            <Globe rotationSpeed={rotationSpeed} radius={globeRadius} />
          </Canvas>
        </div>

        <div className="relative z-10 flex h-full flex-col">{children}</div>
      </div>
    );
  },
);

DotGlobeHero.displayName = "DotGlobeHero";

export { DotGlobeHero, type DotGlobeHeroProps };
