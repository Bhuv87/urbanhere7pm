import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { generatePipeGeometryData } from '../../utils/pipeGenerator';
import { PipeSegment } from './PipeSegment';
import { PipeElbow } from './PipeElbow';
import { PipeFlange } from './PipeFlange';

interface GhostPipePreviewProps {
  cursorPoint: [number, number, number] | null;
}

export const GhostPipePreview: React.FC<GhostPipePreviewProps> = ({ cursorPoint }) => {
  const { draftPipeRun, currentPipeDepth } = useStore();

  const waypoints = draftPipeRun?.waypoints || [];
  const radius = (draftPipeRun?.diameter || 0.4) / 2;

  // Active waypoints + live cursor point (Hooks must run unconditionally)
  const previewWaypoints = useMemo(() => {
    if (!draftPipeRun) return [];
    if (!cursorPoint) return waypoints;
    return [
      ...waypoints,
      {
        x: cursorPoint[0],
        z: cursorPoint[2],
        depth: currentPipeDepth,
      },
    ];
  }, [draftPipeRun, waypoints, cursorPoint, currentPipeDepth]);

  const { segments, elbows, flanges } = useMemo(() => {
    if (!draftPipeRun || previewWaypoints.length < 2) {
      return { segments: [], elbows: [], flanges: [] };
    }
    return generatePipeGeometryData(previewWaypoints);
  }, [draftPipeRun, previewWaypoints]);

  // Early return strictly AFTER all hooks
  if (!draftPipeRun) return null;

  return (
    <group>
      {/* Waypoint Markers */}
      {waypoints.map((wp, idx) => (
        <group key={`wp-${idx}`} position={[wp.x, -wp.depth, wp.z]}>
          <mesh>
            <sphereGeometry args={[radius * 1.5, 12, 12]} />
            <meshStandardMaterial
              color={draftPipeRun.color}
              emissive={draftPipeRun.color}
              emissiveIntensity={0.4}
            />
          </mesh>
          {/* Vertical drop line from ground surface */}
          <mesh position={[0, wp.depth / 2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, wp.depth, 8]} />
            <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
          </mesh>
        </group>
      ))}

      {/* Segments Preview */}
      {segments.map((seg) => (
        <PipeSegment
          key={`prev-seg-${seg.id}`}
          start={seg.start}
          end={seg.end}
          mid={seg.mid}
          length={seg.length}
          direction={seg.direction}
          radius={radius}
          color={draftPipeRun.color}
        />
      ))}

      {/* Elbows Preview */}
      {elbows.map((elb) => (
        <PipeElbow
          key={`prev-elb-${elb.id}`}
          corner={elb.corner}
          inDir={elb.inDir}
          outDir={elb.outDir}
          radius={radius}
          color={draftPipeRun.color}
        />
      ))}

      {/* Flanges Preview */}
      {flanges.map((flg) => (
        <PipeFlange
          key={`prev-flg-${flg.id}`}
          position={flg.position}
          direction={flg.direction}
          radius={radius}
          color={draftPipeRun.color}
        />
      ))}

      {/* Cursor projected ground indicator */}
      {cursorPoint && (
        <mesh position={[cursorPoint[0], 0.05, cursorPoint[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.2, radius * 1.8, 16]} />
          <meshBasicMaterial
            color={draftPipeRun.color}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};
