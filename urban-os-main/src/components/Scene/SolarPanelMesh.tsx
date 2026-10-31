import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';

interface SolarPanelMeshProps {
  roofCenter: [number, number, number];
  roofSize?: [number, number];
  syncMonitor?: boolean;
}

export const SolarPanelMesh: React.FC<SolarPanelMeshProps> = ({ roofCenter, roofSize, syncMonitor = true }) => {
  const { solarTime, shadowedPanels, setShadowedPanels, cadModel, newHouses, streetId } = useStore();
  const groupRef = useRef<THREE.Group>(null);

  const panelW = 1.4; // visual size in meters
  const panelH = 0.9;
  const gap = 0.3;
  const panelCols = roofSize ? Math.max(1, Math.min(6, Math.floor((roofSize[0] - 0.8 + gap) / (panelW + gap)))) : 6;
  const panelRows = roofSize ? Math.max(1, Math.min(4, Math.floor((roofSize[1] - 0.8 + gap) / (panelH + gap)))) : 4;

  // Fit the placed-house array within the roof; existing buildings retain 24 panels.
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
  }, [panelCols, panelRows]);

  const occludedIndices = useMemo(() => {
    const placed = newHouses[streetId] || [];
    const hasTallPlaced = placed.some((p) => p.type === '40x60' || p.type === '30x40');
    return panelPositions.flatMap((_pos, idx) => {
      const isWestColumn = idx % panelCols >= panelCols / 2;
      const shadowed = (solarTime >= 14.5 && isWestColumn) ||
        (solarTime <= 8.5 && !isWestColumn) ||
        (!!cadModel && solarTime >= 13 && idx % 2 === 0) ||
        (hasTallPlaced && solarTime >= 15 && idx > panelPositions.length / 2);
      return shadowed ? [idx] : [];
    });
  }, [solarTime, cadModel, newHouses, streetId, panelPositions, panelCols]);

  // Raycast from each panel toward the sun light direction to detect occlusion
  useEffect(() => {
    if (syncMonitor) setShadowedPanels(occludedIndices);
  }, [syncMonitor, occludedIndices, setShadowedPanels]);

  return (
    <group ref={groupRef} position={roofCenter}>
      {panelPositions.map((pos, idx) => {
        const isShadowed = syncMonitor ? shadowedPanels.includes(idx) : occludedIndices.includes(idx);
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
