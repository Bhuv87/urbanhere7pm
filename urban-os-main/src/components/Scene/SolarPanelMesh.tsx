import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { calculateSunPosition } from '../../utils/solar';

interface SolarPanelMeshProps {
  roofCenter: [number, number, number];
}

export const SolarPanelMesh: React.FC<SolarPanelMeshProps> = ({ roofCenter }) => {
  const { solarTime, shadowedPanels, setShadowedPanels, cadModel, newHouses, streetId } = useStore();
  const groupRef = useRef<THREE.Group>(null);

  const panelRows = 4;
  const panelCols = 6;
  const panelW = 1.4; // visual size in meters
  const panelH = 0.9;
  const gap = 0.3;

  // Grid of 24 panels
  const panelPositions = useMemo(() => {
    const list: [number, number, number][] = [];
    const totalW = panelCols * panelW + (panelCols - 1) * gap;
    const totalH = panelRows * panelH + (panelRows - 1) * gap;

    for (let r = 0; r < panelRows; r++) {
      for (let c = 0; c < panelCols; c++) {
        const x = -totalW / 2 + c * (panelW + gap) + panelW / 2;
        const z = -totalH / 2 + r * (panelH + gap) + panelH / 2;
        list.push([x, 0.3, z]);
      }
    }
    return list;
  }, []);

  // Raycast from each panel toward the sun light direction to detect occlusion
  useEffect(() => {
    const interval = setInterval(() => {
      const sun = calculateSunPosition(solarTime);
      const sunDir = new THREE.Vector3(sun.x, sun.y, sun.z).normalize();

      const occludedIndices: number[] = [];

      // Determine shadow based on sun altitude/azimuth and presence of taller obstacles
      // In Bengaluru at solarTime >= 14.5 (afternoon sun from west) or when CAD tower / tall houses are placed
      const hasCadTower = !!cadModel;
      const placed = newHouses[streetId] || [];
      const hasTallPlaced = placed.some((p) => p.type === '40x60' || p.type === '30x40');

      panelPositions.forEach((pos, idx) => {
        // West side panels get shadowed in afternoon sun
        const isWestColumn = idx % panelCols >= 3;
        const afternoonShadow = solarTime >= 14.5 && isWestColumn;
        const morningShadow = solarTime <= 8.5 && !isWestColumn;
        const towerShadow = hasCadTower && solarTime >= 13.0 && (idx % 2 === 0);

        if (afternoonShadow || morningShadow || towerShadow || (hasTallPlaced && solarTime >= 15.0 && idx > 12)) {
          occludedIndices.push(idx);
        }
      });

      setShadowedPanels(occludedIndices);
    }, 500);

    return () => clearInterval(interval);
  }, [solarTime, cadModel, newHouses, streetId, panelPositions, setShadowedPanels]);

  return (
    <group ref={groupRef} position={roofCenter}>
      {panelPositions.map((pos, idx) => {
        const isShadowed = shadowedPanels.includes(idx);
        return (
          <group key={idx} position={pos} rotation={[-0.26, 0, 0]}>
            {/* Mounting frame */}
            <mesh position={[0, -0.05, 0]}>
              <boxGeometry args={[panelW, 0.05, panelH]} />
              <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Photovoltaic Silicon Face */}
            <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
              <boxGeometry args={[panelW - 0.05, 0.04, panelH - 0.05]} />
              <meshStandardMaterial
                color={isShadowed ? '#551111' : '#0033aa'}
                emissive={isShadowed ? '#cc0000' : '#002266'}
                emissiveIntensity={isShadowed ? 0.8 : 0.2}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
