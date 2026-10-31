import React, { useMemo } from 'react';
import { useStore } from '../../store';
import { getStreet } from '../../dataHelpers';

interface GhostHouseProps {
  snappedPosition: [number, number, number] | null;
}

export const GhostHouse: React.FC<GhostHouseProps> = ({ snappedPosition }) => {
  const {
    armedTool,
    cityId,
    areaId,
    streetId,
    newHouses,
    houseModels,
    selectedHouseModelId,
    ghostRotation3D,
  } = useStore();

  const isHouseArmed = armedTool.type === 'house' && !!armedTool.subType && !!snappedPosition;

  // Resolve matching house model
  const activeModel = useMemo(() => {
    return (
      houseModels.find((m) => m.id === selectedHouseModelId) ||
      houseModels.find((m) => m.category === armedTool.subType) ||
      houseModels[0]
    );
  }, [houseModels, selectedHouseModelId, armedTool.subType]);

  const [width, depth] = activeModel.footprint;
  const height = activeModel.height;

  const street = getStreet(cityId, areaId, streetId);
  const placedList = newHouses[streetId] || [];

  // Hooks must run unconditionally
  const isValid = useMemo(() => {
    if (!isHouseArmed || !snappedPosition) return false;
    const [x, , z] = snappedPosition;

    // Overlapping road?
    const halfRoad = street.roadWidth / 2 + street.sidewalkWidth;
    if (Math.abs(z) < halfRoad + depth / 2 - 0.5) {
      return false;
    }

    // Outside street boundaries?
    if (Math.abs(x) > street.length / 2 - width / 2 || Math.abs(z) > 40) {
      return false;
    }

    // Overlapping existing buildings?
    for (const b of street.buildings) {
      const bHalfW = b.footprint[0] / 2;
      const bHalfD = b.footprint[1] / 2;
      const minX = b.plot[0] - bHalfW - width / 2;
      const maxX = b.plot[0] + bHalfW + width / 2;
      const minZ = b.plot[1] - bHalfD - depth / 2;
      const maxZ = b.plot[1] + bHalfD + depth / 2;
      if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
        return false;
      }
    }

    // Overlapping already placed houses?
    for (const ph of placedList) {
      const phModel = houseModels.find((m) => m.id === ph.modelId) ||
                      houseModels.find((m) => m.category === ph.type);
      const phW = phModel ? phModel.footprint[0] : ph.type === '40x60' ? 12.2 : ph.type === '30x40' ? 9.1 : 6.1;
      const phD = phModel ? phModel.footprint[1] : ph.type === '40x60' ? 18.3 : ph.type === '30x40' ? 12.2 : 9.1;
      const minX = ph.plot[0] - phW / 2 - width / 2;
      const maxX = ph.plot[0] + phW / 2 + width / 2;
      const minZ = ph.plot[1] - phD / 2 - depth / 2;
      const maxZ = ph.plot[1] + phD / 2 + depth / 2;
      if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
        return false;
      }
    }

    return true;
  }, [isHouseArmed, snappedPosition, street, placedList, width, depth, houseModels]);

  // Early return strictly AFTER all hooks
  if (!isHouseArmed || !snappedPosition) {
    return null;
  }

  const ghostColor = isValid ? '#00cc66' : '#ff3300';
  const rotX = (((ghostRotation3D ? ghostRotation3D[0] : 0) * Math.PI) / 180);
  const rotY = (((ghostRotation3D ? ghostRotation3D[1] : 0) * Math.PI) / 180);
  const rotZ = (((ghostRotation3D ? ghostRotation3D[2] : 0) * Math.PI) / 180);

  return (
    <group
      position={[snappedPosition[0], 0.01, snappedPosition[2]]}
      rotation={[rotX, rotY, rotZ]}
    >
      {/* Ghost footprint outline on ground */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color={ghostColor}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Ghost 3D Volumetric Box */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial
          color={ghostColor}
          transparent
          opacity={0.35}
          wireframe={false}
          depthWrite={false}
        />
      </mesh>

      {/* Ghost wireframe frame */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial color={ghostColor} wireframe />
      </mesh>
    </group>
  );
};
