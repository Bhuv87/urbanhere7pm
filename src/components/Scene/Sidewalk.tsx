import React from 'react';

interface SidewalkProps {
  length: number;
  roadWidth: number;
  sidewalkWidth: number;
}

export const Sidewalk: React.FC<SidewalkProps> = ({
  length,
  roadWidth,
  sidewalkWidth,
}) => {
  const zOffset = roadWidth / 2 + sidewalkWidth / 2;

  return (
    <group>
      {/* North Sidewalk */}
      <mesh position={[0, 0.05, -zOffset]} receiveShadow>
        <boxGeometry args={[length, 0.45, sidewalkWidth]} />
        <meshStandardMaterial
          color="#9ca3af"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* South Sidewalk */}
      <mesh position={[0, 0.05, zOffset]} receiveShadow>
        <boxGeometry args={[length, 0.45, sidewalkWidth]} />
        <meshStandardMaterial
          color="#9ca3af"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
};
