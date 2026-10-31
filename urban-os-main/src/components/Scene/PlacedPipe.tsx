import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { PlacedPipeRun } from '../../utils/clashDetection';
import { generatePipeGeometryData } from '../../utils/pipeGenerator';
import { PipeSegment } from './PipeSegment';
import { PipeElbow } from './PipeElbow';
import { PipeFlange } from './PipeFlange';
import { useStore } from '../../store';

interface PlacedPipeProps {
  run: PlacedPipeRun;
  interactive?: boolean;
}

export const PlacedPipe: React.FC<PlacedPipeProps> = ({ run, interactive = true }) => {
  const { selectedObjectId, setSelectedObjectId, removePipeRun, streetId, exploded } = useStore();
  const isSelected = selectedObjectId === run.id;
  const radius = (run.diameter || 0.4) / 2;

  const { segments, elbows, flanges, midPoint } = useMemo(() => {
    const geoData = generatePipeGeometryData(run.waypoints);
    let mid: [number, number, number] = [0, 0, 0];
    if (run.waypoints.length > 0) {
      const midIdx = Math.floor(run.waypoints.length / 2);
      const wp = run.waypoints[midIdx];
      mid = [wp.x, -wp.depth, wp.z];
    }
    return { ...geoData, midPoint: mid };
  }, [run.waypoints]);

  const handleClick = (e: any) => {
    if (!interactive) return;
    e.stopPropagation();
    setSelectedObjectId(run.id);
  };

  const handleContextMenu = (e: any) => {
    if (!interactive) return;
    e.stopPropagation();
    removePipeRun(streetId, run.id);
  };

  const isWater = run.type === 'water';
  const isGas = run.type === 'gas';
  const isPower = run.type === 'power';
  const isFiber = run.type === 'fiber';

  const primaryColor = isSelected
    ? '#ffffff'
    : isWater
    ? '#0284c7'
    : isGas
    ? '#f59e0b'
    : isPower
    ? '#dc2626'
    : '#d946ef';

  return (
    <group
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Segments */}
      {segments.map((seg, idx) => (
        <PipeSegment
          key={`${run.id}-seg-${idx}`}
          runId={run.id}
          start={seg.start}
          end={seg.end}
          mid={seg.mid}
          length={seg.length}
          direction={seg.direction}
          radius={radius}
          color={primaryColor}
        />
      ))}

      {/* Elbows */}
      {elbows.map((elb, idx) => (
        <PipeElbow
          key={`${run.id}-elb-${idx}`}
          runId={run.id}
          corner={elb.corner}
          inDir={elb.inDir}
          outDir={elb.outDir}
          radius={radius}
          color={primaryColor}
        />
      ))}

      {/* Flanges */}
      {flanges.map((flg, idx) => (
        <PipeFlange
          key={`${run.id}-flg-${idx}`}
          position={flg.position}
          direction={flg.direction}
          radius={radius}
          color={primaryColor}
        />
      ))}

      {/* Dedicated Inline Valve at Midpoint */}
      {isWater && (
        <group position={midPoint}>
          <mesh castShadow>
            <boxGeometry args={[radius * 2.2, radius * 2.0, radius * 2.2]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0, radius * 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, radius * 1.4, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          <mesh position={[0, radius * 2.2, 0]} castShadow>
            <torusGeometry args={[radius * 0.8, 0.05, 8, 16]} />
            <meshStandardMaterial color="#dc0000" metalness={0.7} />
          </mesh>
        </group>
      )}

      {isGas && (
        <group position={midPoint}>
          <mesh castShadow>
            <sphereGeometry args={[radius * 1.25, 16, 16]} />
            <meshStandardMaterial color="#eab308" metalness={0.6} />
          </mesh>
          <mesh position={[0.3, radius * 1.1, 0]} rotation={[0, 0, 0.3]} castShadow>
            <boxGeometry args={[0.8, 0.08, 0.12]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.8} />
          </mesh>
        </group>
      )}

      {isPower && (
        <group position={midPoint}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.5, 0.7]} />
            <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <boxGeometry args={[0.4, 0.02, 0.3]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        </group>
      )}

      {isFiber && (
        <group position={[midPoint[0], midPoint[1] + 0.15, midPoint[2]]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.25, 0.25, 1.0, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      )}

      {/* BIM HUD Label when Exploded */}
      {exploded && (
        <Html
          position={[midPoint[0], midPoint[1] + radius + 0.6, midPoint[2]]}
          center
          distanceFactor={28}
        >
          <div className="bg-black/95 text-white border-2 border-white px-2 py-0.5 font-mono text-[9px] hard-shadow-sm whitespace-nowrap pointer-events-none select-none">
            <span className="font-bold uppercase" style={{ color: primaryColor }}>
              {run.type.toUpperCase()} RUN
            </span>
            <span className="text-[#a1a1aa] ml-1.5">
              -{(run.waypoints[0]?.depth || 2.0).toFixed(1)}m · Ø{(radius * 2).toFixed(2)}m
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};
