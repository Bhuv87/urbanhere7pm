import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../../store';

interface PipeSegmentProps {
  start: [number, number, number];
  end: [number, number, number];
  mid: [number, number, number];
  length: number;
  direction: [number, number, number];
  radius: number;
  color: string;
  runId?: string;
}

export const PipeSegment: React.FC<PipeSegmentProps> = ({
  mid,
  length,
  direction,
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

  const rotation = useMemo(() => {
    const dirVec = new THREE.Vector3(...direction).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dirVec);
    const euler = new THREE.Euler().setFromQuaternion(quat);
    return [euler.x, euler.y, euler.z] as [number, number, number];
  }, [direction[0], direction[1], direction[2]]);

  // GSAP animation for position + rotation + scale morph over 700ms (power3.inOut)
  useEffect(() => {
    if (!groupRef.current) return;

    if (!isMountedRef.current) {
      isMountedRef.current = true;
      groupRef.current.position.set(mid[0], mid[1], mid[2]);
      groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
      groupRef.current.scale.set(1, 1, 1);
      return;
    }

    gsap.killTweensOf(groupRef.current.position);
    gsap.killTweensOf(groupRef.current.rotation);
    gsap.killTweensOf(groupRef.current.scale);

    gsap.to(groupRef.current.position, {
      x: mid[0],
      y: mid[1],
      z: mid[2],
      duration: 0.7,
      ease: 'power3.inOut',
    });

    gsap.to(groupRef.current.rotation, {
      x: rotation[0],
      y: rotation[1],
      z: rotation[2],
      duration: 0.7,
      ease: 'power3.inOut',
    });

    gsap.fromTo(
      groupRef.current.scale,
      { x: 1.08, y: 0.92, z: 1.08 },
      { x: 1, y: 1, z: 1, duration: 0.7, ease: 'power3.inOut' }
    );
  }, [mid[0], mid[1], mid[2], rotation[0], rotation[1], rotation[2], length, waypoints]);

  const cuffHalfLen = Math.max(0.01, length / 2 - 0.08);

  return (
    <group ref={groupRef}>
      {/* Main Cylinder Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, length, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>

      {/* Joint cuff near end A */}
      <mesh position={[0, cuffHalfLen, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 1.15, radius * 1.15, 0.16, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Joint cuff near end B */}
      <mesh position={[0, -cuffHalfLen, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 1.15, radius * 1.15, 0.16, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};
