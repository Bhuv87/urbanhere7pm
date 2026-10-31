import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Utility } from '../../dataHelpers';
import { useStore } from '../../store';

interface PreExistingUtilityProps {
  utility: Utility;
}

export const PreExistingUtility: React.FC<PreExistingUtilityProps> = ({ utility }) => {
  const { exploded } = useStore();
  const radius = (utility.diameter || 0.4) / 2;

  // Compute curve, tube geometry, segment lengths, and sample positions for joints/valves
  const {
    tubeGeometry,
    midPoint,
    flangePositions,
    valvePosition,
    tapePositions,
    pipeSegments,
  } = useMemo(() => {
    const points = utility.path.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.05);
    const geo = new THREE.TubeGeometry(curve, 64, radius, 16, false);

    const midIdx = Math.floor(utility.path.length / 2);
    const mid = utility.path[midIdx] || utility.path[0];

    // Compute segment vectors
    const segs: { start: THREE.Vector3; end: THREE.Vector3; dir: THREE.Vector3; len: number }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const dir = new THREE.Vector3().subVectors(end, start);
      const len = dir.length();
      dir.normalize();
      segs.push({ start, end, dir, len });
    }

    // Sample points along curve every ~7m for flanges/collars/valves
    const totalLen = curve.getLength();
    const count = Math.max(3, Math.floor(totalLen / 7));
    const fPositions: { pos: THREE.Vector3; tangent: THREE.Vector3 }[] = [];

    for (let i = 1; i < count; i++) {
      const u = i / count;
      const pos = curve.getPointAt(u);
      const tangent = curve.getTangentAt(u);
      fPositions.push({ pos, tangent });
    }

    const valvePos = curve.getPointAt(0.5);

    // Hazard tape ribbon points (0.35m above power cables)
    const tPositions = points.map((p) => new THREE.Vector3(p.x, p.y + 0.35, p.z));

    return {
      tubeGeometry: geo,
      midPoint: mid,
      flangePositions: fPositions,
      valvePosition: valvePos,
      tapePositions: tPositions,
      pipeSegments: segs,
    };
  }, [utility.path, radius]);

  // Determine dedicated material styling
  const isWater = utility.type === 'water';
  const isGas = utility.type === 'gas';
  const isPower = utility.type === 'power';
  const isFiber = utility.type === 'fiber';

  const primaryColor = isWater
    ? '#0284c7' // Azure Blue (BWSSB)
    : isGas
    ? '#f59e0b' // Safety Amber Yellow (GAIL)
    : isPower
    ? '#dc2626' // Safety Red (BESCOM)
    : '#d946ef'; // Magenta (Fiber)

  return (
    <group>
      {/* 1. MAIN VOLUMETRIC PIPE BODY */}
      <mesh geometry={tubeGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={primaryColor}
          metalness={isWater ? 0.7 : isGas ? 0.4 : 0.6}
          roughness={isWater ? 0.25 : 0.45}
        />
      </mesh>

      {/* 2. REAL-WORLD DEDICATED UTILITY FEATURES */}

      {/* --- A. BWSSB WATER MAIN: Flanged Bolt Circles & Gate Valve Handwheel --- */}
      {isWater && (
        <group>
          {/* Mechanical Bolted Flanges */}
          {flangePositions.map((fp, fi) => {
            const quat = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              fp.tangent
            );
            const rot = new THREE.Euler().setFromQuaternion(quat);
            return (
              <group key={fi} position={[fp.pos.x, fp.pos.y, fp.pos.z]} rotation={rot}>
                {/* Flange Collar Ring */}
                <mesh castShadow>
                  <cylinderGeometry args={[radius * 1.35, radius * 1.35, 0.16, 16]} />
                  <meshStandardMaterial color="#0369a1" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Simulated Flange Bolt Heads */}
                {Array.from({ length: 6 }).map((_, bi) => {
                  const angle = (bi / 6) * Math.PI * 2;
                  const bx = Math.cos(angle) * (radius * 1.18);
                  const bz = Math.sin(angle) * (radius * 1.18);
                  return (
                    <mesh key={bi} position={[bx, 0.1, bz]} castShadow>
                      <cylinderGeometry args={[0.04, 0.04, 0.08, 6]} />
                      <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
                    </mesh>
                  );
                })}
              </group>
            );
          })}

          {/* Inline Sluice Gate Valve at Center */}
          <group position={[valvePosition.x, valvePosition.y, valvePosition.z]}>
            {/* Valve Cast Body */}
            <mesh castShadow>
              <boxGeometry args={[radius * 2.4, radius * 2.2, radius * 2.4]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Valve Bonnet & Spindle Stem */}
            <mesh position={[0, radius * 1.6, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, radius * 1.6, 12]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Red Valve Actuator Handwheel */}
            <mesh position={[0, radius * 2.4, 0]} rotation={[0, 0, 0]} castShadow>
              <torusGeometry args={[radius * 0.9, 0.06, 8, 18]} />
              <meshStandardMaterial color="#dc0000" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- B. GAIL GAS PIPELINE: Yellow Coating, Hazard Stripes & Emergency Shutoff Valve --- */}
      {isGas && (
        <group>
          {/* Black Caution Stripe Collars along Gas Line */}
          {flangePositions.map((fp, fi) => {
            const quat = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              fp.tangent
            );
            const rot = new THREE.Euler().setFromQuaternion(quat);
            return (
              <group key={fi} position={[fp.pos.x, fp.pos.y, fp.pos.z]} rotation={rot}>
                <mesh castShadow>
                  <cylinderGeometry args={[radius * 1.12, radius * 1.12, 0.4, 16]} />
                  <meshStandardMaterial color="#111827" roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.12, 0]}>
                  <cylinderGeometry args={[radius * 1.14, radius * 1.14, 0.1, 16]} />
                  <meshStandardMaterial color="#eab308" roughness={0.4} />
                </mesh>
              </group>
            );
          })}

          {/* Yellow Emergency Quarter-Turn Ball Valve */}
          <group position={[valvePosition.x, valvePosition.y, valvePosition.z]}>
            <mesh castShadow>
              <sphereGeometry args={[radius * 1.3, 16, 16]} />
              <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Valve Lever Handle (Yellow Safety Lock) */}
            <mesh position={[0.4, radius * 1.2, 0]} rotation={[0, 0, 0.3]} castShadow>
              <boxGeometry args={[0.9, 0.08, 0.15]} />
              <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- C. BESCOM POWER: Concrete Warning Tiles, Hazard Ribbon & Splice Vault --- */}
      {isPower && (
        <group>
          {/* Red Safety Warning Concrete Slabs directly above cable */}
          {pipeSegments.map((seg, si) => {
            const slabCount = Math.floor(seg.len / 4.0);
            return Array.from({ length: slabCount }).map((_, sbi) => {
              const u = (sbi + 0.5) / slabCount;
              const pos = new THREE.Vector3().copy(seg.start).lerp(seg.end, u);
              return (
                <mesh
                  key={`${si}-${sbi}`}
                  position={[pos.x, pos.y + radius + 0.15, pos.z]}
                  castShadow
                >
                  <boxGeometry args={[2.8, 0.08, 0.6]} />
                  <meshStandardMaterial color="#b91c1c" roughness={0.8} />
                </mesh>
              );
            });
          })}

          {/* BESCOM 11kV Cable Splice Box / Enclosure at center */}
          <group position={[valvePosition.x, valvePosition.y, valvePosition.z]}>
            <mesh castShadow>
              <boxGeometry args={[1.6, 0.6, 0.8]} />
              <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.6} />
            </mesh>
            {/* High Voltage Flash Symbol Plate */}
            <mesh position={[0, 0.31, 0]}>
              <boxGeometry args={[0.5, 0.02, 0.4]} />
              <meshBasicMaterial color="#facc15" />
            </mesh>
          </group>
        </group>
      )}

      {/* --- D. TELECOM / FIBER: 4-Way Sub-duct Bundle & Dome Splice Closure (FOSC) --- */}
      {isFiber && (
        <group>
          {/* 4 Colored HDPE Micro-ducts in Bundle (Cyan, Green, Yellow, Orange) */}
          {pipeSegments.map((seg, si) => {
            const quat = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              seg.dir
            );
            const rot = new THREE.Euler().setFromQuaternion(quat);
            const subRadius = radius * 0.42;
            const offsets = [
              [-subRadius, -subRadius],
              [subRadius, -subRadius],
              [-subRadius, subRadius],
              [subRadius, subRadius],
            ];
            const colors = ['#06b6d4', '#22c55e', '#facc15', '#f97316'];
            const mid = new THREE.Vector3().copy(seg.start).lerp(seg.end, 0.5);

            return (
              <group key={si} position={[mid.x, mid.y, mid.z]} rotation={rot}>
                {offsets.map(([ox, oz], oi) => (
                  <mesh key={oi} position={[ox, 0, oz]}>
                    <cylinderGeometry args={[subRadius * 0.9, subRadius * 0.9, seg.len, 12]} />
                    <meshStandardMaterial color={colors[oi]} roughness={0.4} />
                  </mesh>
                ))}
                {/* Steel Bundling Straps every 4m */}
                {Array.from({ length: Math.floor(seg.len / 4) }).map((_, bi) => (
                  <mesh key={bi} position={[0, (bi - Math.floor(seg.len / 8)) * 4, 0]}>
                    <cylinderGeometry args={[radius * 1.1, radius * 1.1, 0.12, 12]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.8} />
                  </mesh>
                ))}
              </group>
            );
          })}

          {/* Cylindrical Fiber Optic Splice Closure (FOSC Dome) at Center */}
          <group position={[valvePosition.x, valvePosition.y + 0.2, valvePosition.z]}>
            {/* Main Black Dome Cylinder */}
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Dome Cap */}
            <mesh position={[0, 0.6, 0]} castShadow>
              <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Cable Entry Base Collar */}
            <mesh position={[0, -0.65, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>
        </group>
      )}

      {/* 3. SUBTERRANEAN HUD TAG WHEN EXPLODED (Floating directly above each pipeline) */}
      {exploded && (
        <Html
          position={[midPoint[0], midPoint[1] + radius + 0.6, midPoint[2]]}
          center
          distanceFactor={28}
        >
          <div className="bg-black/95 text-white border-2 border-white px-2.5 py-1 font-mono text-[10px] hard-shadow-sm whitespace-nowrap pointer-events-none select-none">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <span
                className="w-2.5 h-2.5 rounded-none"
                style={{ backgroundColor: primaryColor }}
              />
              <span style={{ color: primaryColor }}>{utility.agency}</span>
              <span className="text-white text-[9px]">[{utility.type.toUpperCase()}]</span>
            </div>
            <div className="text-[#a1a1aa] text-[9px] mt-0.5">
              Depth: -{utility.depth_m.toFixed(1)}m · Outer Ø: {(radius * 2).toFixed(2)}m
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
