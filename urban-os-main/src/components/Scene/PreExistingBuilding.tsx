import React, { useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import { Building } from '../../dataHelpers';
import { SolarPanelMesh } from './SolarPanelMesh';

interface PreExistingBuildingProps {
  building: Building;
}

export const PreExistingBuilding: React.FC<PreExistingBuildingProps> = ({ building }) => {
  const [hovered, setHovered] = useState(false);
  const [width, depth] = building.footprint;
  const height = building.floors * 3.0; // 3m per floor

  const windowPositions = useMemo(() => {
    const list: [number, number, number][] = [];
    const windowCols = Math.max(2, Math.floor(width / 3.0));
    const stepX = width / (windowCols + 1);

    for (let f = 0; f < building.floors; f++) {
      const y = f * 3.0 + 1.5;
      for (let col = 1; col <= windowCols; col++) {
        const x = -width / 2 + col * stepX;
        list.push([x, y, depth / 2 + 0.05]);
        list.push([x, y, -depth / 2 - 0.05]);
      }
    }
    return list;
  }, [width, depth, building.floors]);

  return (
    <group
      position={[building.plot[0], 0, building.plot[1]]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      {/* Main Building Body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={building.type === 'commercial' ? '#94a3b8' : '#cbd5e1'}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Roof Parapet */}
      <mesh position={[0, height + 0.2, 0]} castShadow>
        <boxGeometry args={[width + 0.3, 0.4, depth + 0.3]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* Windows */}
      {windowPositions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <boxGeometry args={[1.2, 1.4, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}

      {/* Solar Panel Array if configured */}
      {building.hasSolar && <SolarPanelMesh roofCenter={[0, height + 0.4, 0]} />}

      {/* Technical Hover Tooltip */}
      {hovered && (
        <Html position={[0, height + 2, 0]} center distanceFactor={25}>
          <div className="bg-black text-white border border-white p-2 font-mono text-[10px] hard-shadow whitespace-nowrap select-none pointer-events-none">
            <div className="font-bold text-[#e5a914]">{building.name || building.id}</div>
            <div className="text-[#cccccc]">
              {building.floors} Floors ({height}m) · {building.type.toUpperCase()}
            </div>
            <div className="text-[9px] text-[#888888]">READ-ONLY GIS ASSET</div>
          </div>
        </Html>
      )}
    </group>
  );
};
