import React, { useMemo } from 'react';
import * as THREE from 'three';
import { LayoutItemType } from '../../types/layout';

interface Props {
  type: LayoutItemType;
  isSelected?: boolean;
}

export const LayoutItemMesh: React.FC<Props> = ({ type, isSelected }) => {
  const houseBoxEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(6, 4.5, 6)), []);
  const parkBoxEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(12, 0.3, 12)), []);
  const roadBoxEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 0.2, 22)), []);

  if (type === 'House') {
    return (
      <group>
        {/* Concrete Foundation Plinth */}
        <mesh position={[0, -2.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.6, 0.4, 6.6]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>

        {/* Main Building Mass */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 4.5, 6]} />
          <meshStandardMaterial color={isSelected ? '#fef08a' : '#f8fafc'} roughness={0.6} />
        </mesh>
        {/* CAD Black Outline Edges */}
        <lineSegments geometry={houseBoxEdges} position={[0, 0, 0]}>
          <lineBasicMaterial color={isSelected ? '#000000' : '#1e293b'} linewidth={2} />
        </lineSegments>

        {/* Pitched Architectural Roof */}
        <mesh position={[0, 3.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[4.8, 2.2, 4]} />
          <meshStandardMaterial color="#991b1b" roughness={0.5} />
        </mesh>

        {/* BIM Window Panels on Facade */}
        <mesh position={[0, 0.7, 3.02]}>
          <boxGeometry args={[3.2, 1.4, 0.05]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.4} />
        </mesh>

        {/* Entrance Door */}
        <mesh position={[0, -1.15, 3.02]}>
          <boxGeometry args={[1.2, 2.1, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    );
  }

  if (type === 'Park') {
    return (
      <group>
        {/* Green Turf Lawn Slab */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[12, 0.3, 12]} />
          <meshStandardMaterial color={isSelected ? '#86efac' : '#22c55e'} roughness={0.8} />
        </mesh>
        <lineSegments geometry={parkBoxEdges}>
          <lineBasicMaterial color="#14532d" />
        </lineSegments>

        {/* Central Paved Path */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[2.5, 0.32, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>

        {/* Stylized Tree 1 */}
        <group position={[-3.2, 0.15, -2.5]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.28, 1.8, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 2.2, 0]} castShadow>
            <dodecahedronGeometry args={[1.2]} />
            <meshStandardMaterial color="#15803d" roughness={0.6} />
          </mesh>
        </group>

        {/* Stylized Tree 2 */}
        <group position={[3.2, 0.15, 2.5]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.28, 1.8, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 2.2, 0]} castShadow>
            <dodecahedronGeometry args={[1.1]} />
            <meshStandardMaterial color="#166534" roughness={0.6} />
          </mesh>
        </group>

        {/* Park Bench */}
        <mesh position={[2.5, 0.35, -2]}>
          <boxGeometry args={[0.8, 0.4, 2]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
      </group>
    );
  }

  if (type === 'Road') {
    return (
      <group>
        {/* Asphalt Road Surface */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[8, 0.2, 22]} />
          <meshStandardMaterial color={isSelected ? '#334155' : '#1e293b'} roughness={0.85} />
        </mesh>
        <lineSegments geometry={roadBoxEdges}>
          <lineBasicMaterial color="#020617" />
        </lineSegments>

        {/* Concrete Curbs */}
        <mesh position={[-4.2, 0.08, 0]}>
          <boxGeometry args={[0.4, 0.35, 22]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[4.2, 0.08, 0]}>
          <boxGeometry args={[0.4, 0.35, 22]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>

        {/* Yellow Dashed Center Line Markings */}
        {[-7, -2.5, 2.5, 7].map((z, idx) => (
          <mesh key={idx} position={[0, 0.11, z]}>
            <boxGeometry args={[0.25, 0.02, 2.8]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        ))}
      </group>
    );
  }

  // Water Pipe (default or 'Water Pipe')
  return (
    <group>
      {/* Concrete Utility Support Saddles */}
      {[-6, 0, 6].map((z, idx) => (
        <mesh key={idx} position={[0, -0.2, z]} castShadow>
          <boxGeometry args={[1.2, 0.4, 0.8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}

      {/* Main High-Pressure Water Pipe Cylinder */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 18, 20]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : '#0284c7'}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Flange Coupling Collars */}
      {[-6, 0, 6].map((z, idx) => (
        <mesh key={idx} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.35, 20]} />
          <meshStandardMaterial color="#0369a1" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Red Isolation Valve Wheel & Riser */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.06, 8, 24]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
