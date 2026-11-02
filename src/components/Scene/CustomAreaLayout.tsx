import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LayoutItemMesh } from './LayoutItemMesh';
import { TransformControlsWrapper } from './TransformControlsWrapper';
import { registerLayoutGroup } from '../../utils/layoutExport';

export const CustomAreaLayout: React.FC = () => {
  const {
    layoutMode,
    layoutItems,
    selectedLayoutItemId,
    setSelectedLayoutItemId,
    layoutTransformMode,
    updateLayoutItem,
  } = useStore();

  const groupRef = useRef<THREE.Group>(null);
  const itemRefs = useRef<Record<string, THREE.Group | null>>({});

  useEffect(() => {
    registerLayoutGroup(groupRef.current);
    return () => registerLayoutGroup(null);
  }, []);

  const handleTransformEnd = (obj: THREE.Object3D) => {
    if (!selectedLayoutItemId) return;
    updateLayoutItem(selectedLayoutItemId, {
      position: [obj.position.x, obj.position.y, obj.position.z],
      rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
      scale: [obj.scale.x, obj.scale.y, obj.scale.z],
    });
  };

  const selectedTarget =
    layoutMode === 'create' && selectedLayoutItemId
      ? itemRefs.current[selectedLayoutItemId] || null
      : null;

  return (
    <>
      <group ref={groupRef} name="CustomAreaLayoutGroup">
        {layoutItems.map((item) => {
          const isSelected = layoutMode === 'create' && selectedLayoutItemId === item.id;
          return (
            <group
              key={item.id}
              ref={(el) => {
                itemRefs.current[item.id] = el;
              }}
              position={item.position}
              rotation={item.rotation}
              scale={item.scale || [1, 1, 1]}
              onClick={(e) => {
                if (layoutMode === 'create') {
                  e.stopPropagation();
                  setSelectedLayoutItemId(item.id);
                }
              }}
            >
              <LayoutItemMesh type={item.type} isSelected={isSelected} />

              {/* CAD Active Selection Indicator in Create Mode */}
              {isSelected && (
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[3.5, 3.8, 32]} />
                  <meshBasicMaterial color="#00ff66" side={THREE.DoubleSide} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* TransformControls gizmo active only in Create mode on selected item */}
      {layoutMode === 'create' && (
        <TransformControlsWrapper
          target={selectedTarget}
          mode={layoutTransformMode}
          onTransformEnd={handleTransformEnd}
        />
      )}
    </>
  );
};
