import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { StreetData } from '../../dataHelpers';
import { useStore } from '../../store';
import { Road } from './Road';
import { Sidewalk } from './Sidewalk';
import { PreExistingBuilding } from './PreExistingBuilding';
import { PreExistingUtility } from './PreExistingUtility';
import { PlacedHouse } from './PlacedHouse';
import { PlacedPipe } from './PlacedPipe';
import { CADBuilding } from './CADBuilding';
import { ClashBadge } from './ClashBadge';
import { GhostHouse } from './GhostHouse';
import { GhostPipePreview } from './GhostPipePreview';
import { HeightLimitPlane } from './HeightLimitPlane';
import { UtilityTrench } from './UtilityTrench';

interface StreetProps {
  street: StreetData;
  isFocused: boolean;
  cursorPoint: [number, number, number] | null;
}

export const Street: React.FC<StreetProps> = ({
  street,
  isFocused,
  cursorPoint,
}) => {
  const { exploded, newHouses, newPipeRuns, clashes } = useStore();
  const surfaceGroupRef = useRef<THREE.Group>(null);

  // GSAP animation for Explode road surface lift
  useEffect(() => {
    if (!surfaceGroupRef.current) return;
    const targetY = exploded ? 9.5 : 0.0;
    gsap.to(surfaceGroupRef.current.position, {
      y: targetY,
      duration: 1.2,
      ease: 'power3.inOut',
    });
  }, [exploded]);

  const houses = newHouses[street.id] || [];
  const pipes = newPipeRuns[street.id] || [];
  const streetClashes = isFocused ? clashes : [];

  return (
    <group position={street.origin}>
      {/* 0. SUBTERRANEAN EXCAVATION TRENCH (Always present underneath the road corridor) */}
      {isFocused && (
        <UtilityTrench
          length={street.length}
          roadWidth={street.roadWidth}
        />
      )}

      {/* 1. LIFTING SURFACE GROUP (Road, Sidewalks, Buildings, Placed Houses, CAD) */}
      <group ref={surfaceGroupRef}>
        <Road
          length={street.length}
          width={street.roadWidth}
          isFocused={isFocused}
        />
        <Sidewalk
          length={street.length}
          roadWidth={street.roadWidth}
          sidewalkWidth={street.sidewalkWidth}
        />

        {/* Pre-existing buildings */}
        {street.buildings.map((b) => (
          <PreExistingBuilding key={b.id} building={b} />
        ))}

        {/* User-placed houses */}
        {houses.map((h) => (
          <PlacedHouse key={h.id} house={h} interactive={isFocused} />
        ))}

        {/* CAD Building (only on focused street) */}
        {isFocused && <CADBuilding />}
      </group>

      {/* 2. FIXED UNDERGROUND UTILITIES GROUP (Stays anchored in trench bed with rich BIM details) */}
      <group>
        {street.utilities.map((u) => (
          <PreExistingUtility key={u.id} utility={u} />
        ))}

        {/* User-placed pipe runs */}
        {pipes.map((run) => (
          <PlacedPipe key={run.id} run={run} interactive={isFocused} />
        ))}

        {/* Clash Badges */}
        {streetClashes.map((c) => (
          <ClashBadge key={c.id} clash={c} />
        ))}
      </group>

      {/* 3. LIVE GHOST PREVIEWS & REGULATORY CEILING (Only on focused street) */}
      {isFocused && (
        <>
          <HeightLimitPlane />
          <GhostHouse snappedPosition={cursorPoint} />
          <GhostPipePreview cursorPoint={cursorPoint} />
        </>
      )}
    </group>
  );
};
