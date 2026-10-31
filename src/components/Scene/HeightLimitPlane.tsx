import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { getStreet } from '../../dataHelpers';

export const HeightLimitPlane: React.FC = () => {
  const { cityId, areaId, streetId, zoningHeightLimit, newHouses, houseModels, cadModel } = useStore();
  const street = getStreet(cityId, areaId, streetId);

  // Check if any placed house or CAD model exceeds the height limit
  const isViolated = useMemo(() => {
    // Check CAD model
    if (cadModel && cadModel.bbox) {
      const cadH = Math.max(0, cadModel.bbox.max[1] - cadModel.bbox.min[1]);
      if (cadH > zoningHeightLimit) return true;
    }
    // Check placed houses
    const houses = newHouses[streetId] || [];
    for (const h of houses) {
      const m = (h.modelId && houseModels.find((model) => model.id === h.modelId)) ||
                houseModels.find((model) => model.category === h.type);
      const hHeight = h.customHeight || (m ? m.height : 6.8);
      if (hHeight > zoningHeightLimit) return true;
    }
    return false;
  }, [cadModel, newHouses, streetId, houseModels, zoningHeightLimit]);

  const planeWidth = street.length + 40;
  const planeDepth = 80;
  const planeColor = isViolated ? '#dc0000' : '#eab308';

  return (
    <group position={[0, zoningHeightLimit, 0]}>
      {/* Semi-transparent regulatory ceiling plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[planeWidth, planeDepth]} />
        <meshBasicMaterial
          color={planeColor}
          transparent
          opacity={isViolated ? 0.18 : 0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid Wireframe for datum alignment */}
      <gridHelper
        args={[planeWidth, 30, planeColor, planeColor]}
        position={[0, 0.02, 0]}
      />

      {/* Boundary Perimeter Lines */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(planeWidth, planeDepth)]} />
        <lineBasicMaterial color={planeColor} linewidth={2} />
      </lineSegments>

      {/* Visual Datum Marker Post on side */}
      <mesh position={[-street.length / 2 - 2, -zoningHeightLimit / 2, -planeDepth / 2 + 5]}>
        <cylinderGeometry args={[0.08, 0.08, zoningHeightLimit, 8]} />
        <meshBasicMaterial color={planeColor} />
      </mesh>
    </group>
  );
};
