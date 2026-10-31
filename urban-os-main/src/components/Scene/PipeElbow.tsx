import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../../store';

interface PipeElbowProps {
  corner: [number, number, number];
  inDir: [number, number, number];
  outDir: [number, number, number];
  radius: number;
  color: string;
  runId?: string;
}

export const PipeElbow: React.FC<PipeElbowProps> = ({
  corner,
  inDir,
  outDir,
  radius,
  color,
  runId,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const isMountedRef = useRef(false);

  // Read current waypoints for this runId from the store
  const waypoints = useStore((state) => {
    if (!runId) return null;
    const runs = state.newPipeRuns[state.streetId] || [];
    const r = runs.find((p) => p.id === runId);
    return r ? r.waypoints : null;
  });

  const { tubeGeo } = useMemo(() => {
    const c = new THREE.Vector3(0, 0, 0);
    const inV = new THREE.Vector3(...inDir).normalize().multiplyScalar(radius * 1.5);
    const outV = new THREE.Vector3(...outDir).normalize().multiplyScalar(radius * 1.5);

    const p0 = new THREE.Vector3().copy(c).add(inV);
    const p1 = new THREE.Vector3().copy(c);
    const p2 = new THREE.Vector3().copy(c).add(outV);

    const curve = new THREE.CatmullRomCurve3([p0, p1, p2]);
    const geo = new THREE.TubeGeometry(curve, 24, radius, 12, false);
    return { tubeGeo: geo };
  }, [inDir[0], inDir[1], inDir[2], outDir[0], outDir[1], outDir[2], radius]);

  // GSAP animation for position + scale morph over 700ms (power3.inOut)
  useEffect(() => {
    if (!groupRef.current) return;

    if (!isMountedRef.current) {
      isMountedRef.current = true;
      groupRef.current.position.set(corner[0], corner[1], corner[2]);
      groupRef.current.scale.set(1, 1, 1);
      return;
    }

    gsap.killTweensOf(groupRef.current.position);
    gsap.killTweensOf(groupRef.current.scale);

    gsap.to(groupRef.current.position, {
      x: corner[0],
      y: corner[1],
      z: corner[2],
      duration: 0.7,
      ease: 'power3.inOut',
    });

    gsap.fromTo(
      groupRef.current.scale,
      { x: 1.1, y: 1.1, z: 1.1 },
      { x: 1, y: 1, z: 1, duration: 0.7, ease: 'power3.inOut' }
    );
  }, [corner[0], corner[1], corner[2], waypoints]);

  return (
    <group ref={groupRef}>
      {/* Curved elbow tube */}
      <mesh geometry={tubeGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>

      {/* Joint sleeve at corner */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[radius * 1.35, 12, 12]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
};
