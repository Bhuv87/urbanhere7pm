import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { PlacedPipeRun } from '../../utils/clashDetection';

interface PipeConnectionMarkersProps {
  run: PlacedPipeRun;
  destination: string;
  houseLabel: string;
}

export const PipeConnectionMarkers: React.FC<PipeConnectionMarkersProps> = ({
  run, destination, houseLabel,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  if (!run.sourceHouseId || run.waypoints.length < 2) return null;
  const start = run.waypoints[0];
  const end = run.waypoints[run.waypoints.length - 1];
  const marker = (wp: typeof start, key: string, isMain: boolean) => (
    <group key={key} position={[wp.x, -wp.depth, wp.z]}>
      <mesh
        onPointerOver={(event) => { event.stopPropagation(); setHovered(key); }}
        onPointerOut={(event) => { event.stopPropagation(); setHovered(null); }}
      >
        <sphereGeometry args={[isMain ? 0.48 : 0.38, 10, 10]} />
        <meshBasicMaterial color={isMain ? run.color : '#ffffff'} />
      </mesh>
      {hovered === key && (
        <Html position={[0, 0.8, 0]} center distanceFactor={18} zIndexRange={[100, 0]}>
          <div className="bg-white text-black border border-black shadow-[3px_3px_0_0_#000] px-2 py-1 font-mono text-[10px] font-bold whitespace-nowrap pointer-events-none">
            {houseLabel} → {destination}
          </div>
        </Html>
      )}
    </group>
  );
  return (
    <group>
      {marker(start, 'house', false)}
      {marker(end, 'main', true)}
    </group>
  );
};
