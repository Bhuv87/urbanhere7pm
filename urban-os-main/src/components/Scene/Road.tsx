import React from 'react';

interface RoadProps {
  length: number;
  width: number;
  isFocused?: boolean;
}

export const Road: React.FC<RoadProps> = ({ length, width, isFocused = true }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Asphalt Road Slab */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[length, 0.4, width]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Yellow Center Road Line */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[length * 0.95, 0.02, 0.2]} />
        <meshStandardMaterial color="#facc15" roughness={0.6} />
      </mesh>

      {/* Focused Road Edge Accent Stripes */}
      {isFocused && (
        <>
          <mesh position={[0, 0.21, width / 2 - 0.05]}>
            <boxGeometry args={[length, 0.02, 0.1]} />
            <meshStandardMaterial
              color="#4a9eff"
              emissive="#4a9eff"
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[0, 0.21, -width / 2 + 0.05]}>
            <boxGeometry args={[length, 0.02, 0.1]} />
            <meshStandardMaterial
              color="#4a9eff"
              emissive="#4a9eff"
              emissiveIntensity={0.6}
            />
          </mesh>
        </>
      )}
    </group>
  );
};
