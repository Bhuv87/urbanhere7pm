import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ClashResult } from '../../utils/clashDetection';
import { useStore } from '../../store';

interface ClashBadgeProps {
  clash: ClashResult;
}

export const ClashBadge: React.FC<ClashBadgeProps> = ({ clash }) => {
  const { exploded, scanResults, runScan, rerouteInProgress } = useStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Pulse animation: 0.9 <-> 1.1 scale
  useFrame(({ clock }) => {
    if (meshRef.current && !rerouteInProgress) {
      const s = 1.0 + Math.sin(clock.getElapsedTime() * 6.0) * 0.15;
      meshRef.current.scale.set(s, s, s);
    }
  });

  // Animated fade out when rerouting
  useEffect(() => {
    if (!groupRef.current) return;
    if (rerouteInProgress) {
      gsap.to(groupRef.current.scale, {
        x: 0.001,
        y: 0.001,
        z: 0.001,
        duration: 0.5,
        ease: 'power3.inOut',
      });
    } else {
      gsap.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: 'power3.out',
      });
    }
  }, [rerouteInProgress]);

  const handleClick = (e: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (scanResults === null) {
      runScan();
    }
  };

  if (!exploded) return null;

  return (
    <group ref={groupRef} position={clash.position} onClick={handleClick}>
      {/* Pulsing Red Torus */}
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.12, 12, 24]} />
        <meshBasicMaterial color="#dc0000" wireframe={false} />
      </mesh>

      {/* Sphere Indicator Core */}
      <mesh>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshBasicMaterial color="#ff3300" />
      </mesh>

      {/* Technical HUD Tag */}
      <Html position={[0, 0.9, 0]} center distanceFactor={22}>
        <div
          onClick={handleClick}
          className="bg-[#dc0000] text-white border border-black px-2 py-1 font-mono text-[10px] font-bold hard-shadow whitespace-nowrap cursor-pointer select-none active:translate-x-[1px] active:translate-y-[1px]"
        >
          <div>⚠ CLASH — {clash.distance}m</div>
          <div className="text-[9px] font-normal text-white/90">
            {clash.newType} × {clash.existingAgency} (REQ: {clash.safetyThreshold}m)
          </div>
        </div>
      </Html>
    </group>
  );
};
