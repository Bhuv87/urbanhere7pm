import React from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';

interface UtilityTrenchProps {
  length: number;
  roadWidth: number;
}

export const UtilityTrench: React.FC<UtilityTrenchProps> = ({ length, roadWidth }) => {
  const { exploded } = useStore();

  const trenchWidth = roadWidth + 3.0; // Extend slightly past road edge
  const trenchDepth = 3.6; // Deep enough for all utilities down to -2.5m + bedding
  const trenchFloorY = -trenchDepth;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Subterranean Excavation Trench (Visible especially when exploded) */}
      <group>
        {/* Trench Floor Bedding (Compacted crushed stone / river sand bedding) */}
        <mesh position={[0, trenchFloorY + 0.1, 0]} receiveShadow>
          <boxGeometry args={[length + 6, 0.2, trenchWidth]} />
          <meshStandardMaterial
            color="#475569"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>

        {/* North Trench Retaining Wall (Earth/Shoring Sheet Piles) */}
        <mesh position={[0, -trenchDepth / 2, -trenchWidth / 2 - 0.15]} receiveShadow>
          <boxGeometry args={[length + 6, trenchDepth, 0.3]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* South Trench Retaining Wall */}
        <mesh position={[0, -trenchDepth / 2, trenchWidth / 2 + 0.15]} receiveShadow>
          <boxGeometry args={[length + 6, trenchDepth, 0.3]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* East Trench End Cap Wall */}
        <mesh position={[length / 2 + 3, -trenchDepth / 2, 0]} receiveShadow>
          <boxGeometry args={[0.3, trenchDepth, trenchWidth + 0.6]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>

        {/* West Trench End Cap Wall */}
        <mesh position={[-length / 2 - 3, -trenchDepth / 2, 0]} receiveShadow>
          <boxGeometry args={[0.3, trenchDepth, trenchWidth + 0.6]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>

        {/* Trench Depth Gauge Wall Markers (at center node) */}
        {[-0.9, -1.4, -1.8, -2.5].map((depthY) => (
          <group key={depthY} position={[0, depthY, -trenchWidth / 2 + 0.05]}>
            {/* Horizontal Depth Line */}
            <mesh>
              <boxGeometry args={[length * 0.9, 0.04, 0.05]} />
              <meshBasicMaterial color="#ffffff" wireframe />
            </mesh>
          </group>
        ))}

        {/* Hazard Safety Striping on Trench Lip when exploded */}
        {exploded && (
          <>
            <mesh position={[0, 0.01, -trenchWidth / 2 - 0.25]}>
              <boxGeometry args={[length + 4, 0.02, 0.3]} />
              <meshStandardMaterial color="#eab308" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.01, trenchWidth / 2 + 0.25]}>
              <boxGeometry args={[length + 4, 0.02, 0.3]} />
              <meshStandardMaterial color="#eab308" roughness={0.5} />
            </mesh>
          </>
        )}
      </group>

      {/* 2. Subsurface Inspection Illumination (Illuminates pipes inside the trench) */}
      <group position={[0, 0.5, 0]}>
        <pointLight position={[-35, 1.5, 0]} intensity={18} distance={60} color="#ffffff" />
        <pointLight position={[0, 1.5, 0]} intensity={22} distance={60} color="#ffffff" />
        <pointLight position={[35, 1.5, 0]} intensity={18} distance={60} color="#ffffff" />
      </group>
    </group>
  );
};
