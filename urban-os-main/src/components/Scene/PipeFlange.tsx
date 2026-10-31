import React, { useMemo } from 'react';
import * as THREE from 'three';

interface PipeFlangeProps {
  position: [number, number, number];
  direction: [number, number, number];
  radius: number;
  color: string;
}

export const PipeFlange: React.FC<PipeFlangeProps> = ({
  position,
  direction,
  radius,
  color,
}) => {
  const rotation = useMemo(() => {
    const dirVec = new THREE.Vector3(...direction).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dirVec);
    const euler = new THREE.Euler().setFromQuaternion(quat);
    return [euler.x, euler.y, euler.z] as [number, number, number];
  }, [direction]);

  return (
    <group position={position} rotation={rotation}>
      {/* Torus flange ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[radius * 1.35, radius * 0.18, 8, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
};
