import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Html } from '@react-three/drei';
import { StreetData, getLocalBuildings, getLocalUtilities } from '../../dataHelpers';
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
import { PipeConnectionMarkers } from './PipeConnectionMarkers';

interface StreetProps {
  street: StreetData;
  isFocused: boolean;
  cursorPoint: [number, number, number] | null;
  showUtilities: boolean;
  pipelineFocusMode: boolean;
}

export const Street: React.FC<StreetProps> = ({
  street,
  isFocused,
  cursorPoint,
  showUtilities,
  pipelineFocusMode,
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
  const localBuildings = useMemo(() => getLocalBuildings(street), [street]);
  const localUtilities = useMemo(() => getLocalUtilities(street), [street]);
  const streetClashes = clashes.filter((clash) =>
    (clash as any).streetId ? (clash as any).streetId === street.id : isFocused);

  return (
    <group position={street.origin}>
      {/* 0. SUBTERRANEAN EXCAVATION TRENCH (Always present underneath the road corridor) */}
      {isFocused && !pipelineFocusMode && (
        <UtilityTrench
          length={street.length}
          roadWidth={street.roadWidth}
        />
      )}

      {/* 1. LIFTING SURFACE GROUP (Road, Sidewalks, Buildings, Placed Houses, CAD) */}
      <group ref={surfaceGroupRef}>
        {!pipelineFocusMode && <>
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
        {localBuildings.map((b) => (
          <PreExistingBuilding key={b.id} building={b} />
        ))}

        {/* User-placed houses */}
        {houses.map((h) => (
          <PlacedHouse key={h.id} house={h} interactive={isFocused} />
        ))}

        {/* CAD Building (only on focused street) */}
        {isFocused && <CADBuilding />}
        </>}
      </group>

      {/* 2. FIXED UNDERGROUND UTILITIES GROUP (Stays anchored in trench bed with rich BIM details) */}
      {(showUtilities || pipelineFocusMode) && <group>
        {localUtilities.map((u) => (
          <PreExistingUtility key={u.id} utility={u} />
        ))}

        {/* User-placed pipe runs */}
        {pipes.map((run) => (
          <PlacedPipe key={run.id} run={run} interactive={isFocused} />
        ))}
        {pipelineFocusMode && localUtilities.map((utility) => {
          const mid = utility.path[Math.floor(utility.path.length / 2)];
          return mid && (
            <Html key={utility.id} position={[mid[0], mid[1] + 0.8, mid[2]]} center distanceFactor={32} zIndexRange={[80, 0]}>
              <div className="bg-white text-black border border-black shadow-[3px_3px_0_0_#000] px-2 py-1 font-mono text-[9px] font-bold whitespace-nowrap pointer-events-none">
                {utility.agency} // {utility.type.toUpperCase()} MAIN
              </div>
            </Html>
          );
        })}
        {pipelineFocusMode && pipes.map((run) => {
          const utility = localUtilities.find((item) => item.id === run.connectedMainId);
          const houseIndex = houses.findIndex((house) => house.id === run.sourceHouseId);
          return (
            <PipeConnectionMarkers
              key={`connection-${run.id}`}
              run={run}
              destination={utility ? `${utility.agency} ${utility.type.toUpperCase()} MAIN` : 'MANUAL MAIN'}
              houseLabel={houseIndex >= 0 ? `HOUSE ${houseIndex + 1}` : 'HOUSE'}
            />
          );
        })}

        {/* Clash Badges */}
        {streetClashes.map((c) => (
          <ClashBadge key={c.id} clash={c} />
        ))}
      </group>}

      {/* 3. LIVE GHOST PREVIEWS & REGULATORY CEILING (Only on focused street) */}
      {isFocused && !pipelineFocusMode && (
        <>
          <HeightLimitPlane />
          <GhostHouse snappedPosition={cursorPoint} />
          <GhostPipePreview cursorPoint={cursorPoint} />
        </>
      )}
    </group>
  );
};
