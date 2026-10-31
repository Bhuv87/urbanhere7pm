import React, { useMemo } from 'react';
import { PlacedHouseData } from '../../utils/exportGeoJSON';
import { useStore } from '../../store';
import { HouseArchitecture } from './HouseArchitecture';
import { HouseModelVariant } from '../../data/houseModels';

interface PlacedHouseProps {
  house: PlacedHouseData;
  interactive?: boolean;
}

export const PlacedHouse: React.FC<PlacedHouseProps> = ({ house, interactive = true }) => {
  const { selectedObjectId, setSelectedObjectId, removeHouse, streetId, houseModels, zoningHeightLimit } =
    useStore();
  const isSelected = selectedObjectId === house.id;

  // Resolve matching house model variant
  const model = useMemo<HouseModelVariant>(() => {
    if (house.modelId) {
      const found = houseModels.find((m) => m.id === house.modelId);
      if (found) return found;
    }
    // Fallback by category
    const foundCat = houseModels.find((m) => m.category === house.type);
    if (foundCat) return foundCat;

    // Default 20x30
    return houseModels[0];
  }, [house.modelId, house.type, houseModels]);

  const effectiveHeight = house.customHeight || model.height;
  const isHeightViolation = effectiveHeight > zoningHeightLimit;

  // 3D Rotation (Pitch X, Yaw Y, Roll Z) in radians
  const rotX = (((house.rotation3D ? house.rotation3D[0] : 0) * Math.PI) / 180);
  const rotY = house.rotation3D
    ? ((house.rotation3D[1] * Math.PI) / 180)
    : (house.rotation || 0);
  const rotZ = (((house.rotation3D ? house.rotation3D[2] : 0) * Math.PI) / 180);

  const handleClick = (e: any) => {
    if (!interactive) return;
    e.stopPropagation();
    setSelectedObjectId(house.id);
  };

  const handleContextMenu = (e: any) => {
    if (!interactive) return;
    e.stopPropagation();
    removeHouse(streetId, house.id);
  };

  return (
    <group
      position={[house.plot[0], 0, house.plot[1]]}
      rotation={[rotX, rotY, rotZ]}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <HouseArchitecture model={model} isSelected={isSelected} />

      {/* Height Limit Violation Indicator */}
      {isHeightViolation && (
        <group position={[0, effectiveHeight + 0.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
            <meshBasicMaterial color="#dc0000" />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshBasicMaterial color="#dc0000" />
          </mesh>
        </group>
      )}
    </group>
  );
};
