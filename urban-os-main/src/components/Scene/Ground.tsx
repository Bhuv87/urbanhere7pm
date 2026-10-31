import React, { useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useStore } from '../../store';
import { gridSnap } from '../../utils/gridSnap';

interface GroundProps {
  onPointerMoveGround?: (point: [number, number, number]) => void;
}

export const Ground: React.FC<GroundProps> = ({ onPointerMoveGround }) => {
  const {
    armedTool,
    streetId,
    placeHouse,
    addPipeWaypoint,
    currentPipeDepth,
    draftPipeRun,
    commitPipeRun,
    exploded,
  } = useStore();

  const meshRef = useRef<THREE.Mesh>(null);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const pt = e.point;
    const snappedX = gridSnap(pt.x, 1);
    const snappedZ = gridSnap(pt.z, 1);
    onPointerMoveGround?.([snappedX, 0, snappedZ]);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const pt = e.point;
    const snappedX = gridSnap(pt.x, 1);
    const snappedZ = gridSnap(pt.z, 1);

    if (armedTool.type === 'house' && armedTool.subType) {
      const selectedModelId = useStore.getState().selectedHouseModelId;
      const ghostRot = useStore.getState().ghostRotation3D || [0, 0, 0];
      placeHouse(streetId, {
        id: `house-${Date.now()}`,
        type: armedTool.subType as any,
        modelId: selectedModelId,
        plot: [snappedX, snappedZ],
        rotation: (ghostRot[1] * Math.PI) / 180,
        rotation3D: [ghostRot[0], ghostRot[1], ghostRot[2]],
      });
    } else if (armedTool.type === 'pipe') {
      if (armedTool.mode === 'vertical') {
        // Drop vertical riser tool
        const riserDepth = Math.max(1.0, currentPipeDepth);
        addPipeWaypoint({ x: snappedX, z: snappedZ, depth: 0.5 });
        addPipeWaypoint({ x: snappedX, z: snappedZ, depth: riserDepth });
        commitPipeRun();
      } else {
        // Draw run waypoint
        addPipeWaypoint({
          x: snappedX,
          z: snappedZ,
          depth: currentPipeDepth,
        });
      }
    }
  };

  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (armedTool.type === 'pipe' && draftPipeRun && draftPipeRun.waypoints.length >= 2) {
      commitPipeRun();
    }
  };

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <planeGeometry args={[600, 600]} />
      <meshStandardMaterial
        color="#22262c"
        roughness={0.9}
        metalness={0.1}
        transparent={exploded}
        opacity={exploded ? 0.35 : 1.0}
        depthWrite={!exploded}
      />
    </mesh>
  );
};
