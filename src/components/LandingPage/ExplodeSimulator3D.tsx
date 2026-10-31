import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { isSoftwareGl } from '../../utils/softwareGl';
import { audioFX } from './AudioFX';

interface ExplodeModelProps {
  explodeHeight: number;
  showWater: boolean;
  showGas: boolean;
  showPower: boolean;
  showFiber: boolean;
  showClash: boolean;
}

const ExplodeModel: React.FC<ExplodeModelProps> = ({
  explodeHeight,
  showWater,
  showGas,
  showPower,
  showFiber,
  showClash,
}) => {
  const roadGroupRef = useRef<THREE.Group>(null);
  const clashPulsarRef = useRef<THREE.Mesh>(null);

  // Smooth lerp to target explode height
  useFrame(({ clock }) => {
    if (roadGroupRef.current) {
      roadGroupRef.current.position.y += (explodeHeight - roadGroupRef.current.position.y) * 0.08;
    }
    if (clashPulsarRef.current) {
      const s = 1.0 + Math.sin(clock.getElapsedTime() * 8) * 0.2;
      clashPulsarRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. LIFTING ROAD & SURFACE INFRASTRUCTURE */}
      <group ref={roadGroupRef} position={[0, 0, 0]}>
        {/* Asphalt Road Deck */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[26, 0.4, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* Yellow Double Center Striping */}
        <mesh position={[0, 0.21, 0.1]}>
          <boxGeometry args={[25.6, 0.02, 0.12]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        <mesh position={[0, 0.21, -0.1]}>
          <boxGeometry args={[25.6, 0.02, 0.12]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        {/* Sidewalk Pavement */}
        <mesh position={[0, 0.08, 4.8]} receiveShadow>
          <boxGeometry args={[26, 0.5, 1.6]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.08, -4.8]} receiveShadow>
          <boxGeometry args={[26, 0.5, 1.6]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.9} />
        </mesh>
        {/* Pedestrian Kerb Accent */}
        <mesh position={[0, 0.35, 4.02]}>
          <boxGeometry args={[26, 0.15, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.35, -4.02]}>
          <boxGeometry args={[26, 0.15, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Surface Buildings / Houses (Nilaya & Modern Duplex) */}
        <group position={[-6.5, 0.3, -7.5]}>
          <mesh castShadow receiveShadow position={[0, 3.2, 0]}>
            <boxGeometry args={[6.1, 6.4, 6.0]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.6} />
          </mesh>
          <mesh position={[0, 6.5, 0]}>
            <boxGeometry args={[6.4, 0.3, 6.3]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>
        </group>

        <group position={[6.5, 0.3, -7.5]}>
          <mesh castShadow receiveShadow position={[0, 4.0, 0]}>
            <boxGeometry args={[7.5, 8.0, 6.0]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
          </mesh>
          <mesh position={[0, 8.1, 0]}>
            <boxGeometry args={[7.8, 0.3, 6.3]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* 2. SUBTERRANEAN TRENCH EXCAVATION (Remains anchored in bedrock) */}
      <group position={[0, -3.2, 0]}>
        {/* Trench Bed Foundation */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[28, 0.4, 11]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
        {/* Trench Earth Shoring Retaining Walls */}
        <mesh position={[0, 1.6, -5.6]} receiveShadow>
          <boxGeometry args={[28, 3.2, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.6, 5.6]} receiveShadow>
          <boxGeometry args={[28, 3.2, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>

        {/* Subsurface Depth Laser Indicators */}
        {[-0.9, -1.4, -1.8, -2.5].map((d, i) => (
          <group key={i} position={[0, d + 3.2, -5.4]}>
            <mesh>
              <boxGeometry args={[26, 0.04, 0.04]} />
              <meshBasicMaterial color="#ffffff" wireframe />
            </mesh>
          </group>
        ))}

        {/* PIPELINE 1: BWSSB WATER MAIN (-2.5m, 0.8m Dia Azure Blue) */}
        {showWater && (
          <group position={[0, 0.7, -2.2]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.42, 0.42, 27, 24]} />
              <meshStandardMaterial color="#00aaff" metalness={0.7} roughness={0.25} />
            </mesh>
            {/* Flanged Rings */}
            {[-10, -5, 0, 5, 10].map((fp, i) => (
              <mesh key={i} position={[0, fp, 0]}>
                <torusGeometry args={[0.55, 0.06, 8, 16]} />
                <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>
        )}

        {/* PIPELINE 2: GAIL GAS PIPELINE (-1.8m, 0.45m Dia Safety Amber) */}
        {showGas && (
          <group position={[0, 1.4, 2.0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.26, 0.26, 27, 24]} />
              <meshStandardMaterial color="#ff8800" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Caution Rings */}
            {[-8, -2, 4, 9].map((gp, i) => (
              <mesh key={i} position={[0, gp, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
                <meshStandardMaterial color="#111827" roughness={0.5} />
              </mesh>
            ))}
          </group>
        )}

        {/* PIPELINE 3: BESCOM 11kV HIGH VOLTAGE POWER (-1.4m, 0.35m Red) */}
        {showPower && (
          <group position={[0, 1.8, -0.6]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.2, 27, 20]} />
              <meshStandardMaterial color="#ff3300" metalness={0.5} roughness={0.4} />
            </mesh>
            {/* Red Concrete Warning Slabs directly overhead */}
            {[-9, -3, 3, 9].map((sp, i) => (
              <mesh key={i} position={[0, sp, 0.35]} rotation={[0, 0, -Math.PI / 2]}>
                <boxGeometry args={[0.1, 2.4, 0.55]} />
                <meshStandardMaterial color="#b91c1c" roughness={0.8} />
              </mesh>
            ))}
          </group>
        )}

        {/* PIPELINE 4: TELECOM OPTICAL FIBER CONDUIT (-1.0m, 0.2m Magenta) */}
        {showFiber && (
          <group position={[0, 2.2, 3.6]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.12, 0.12, 27, 16]} />
              <meshStandardMaterial color="#ff00aa" metalness={0.4} roughness={0.4} />
            </mesh>
            {/* Cylindrical Splice Dome Joint */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.24, 0.24, 0.9, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )}

        {/* 3. SIMULATED CROSS-RUN WITH SPATIAL CLASH HALO */}
        {showClash && (
          <group position={[2.5, 0.7, 0]}>
            {/* Unplanned Cross-Lateral Line cutting across trench */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.65, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 8, 16]} />
              <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Pulsing Clash Alert Halo at Spatial Collision Point */}
            <group ref={clashPulsarRef} position={[0, 0.7, -2.2]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.85, 0.1, 16, 24]} />
                <meshBasicMaterial color="#dc0000" />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshBasicMaterial color="#ff2200" />
              </mesh>
            </group>
          </group>
        )}
      </group>
    </group>
  );
};

export const ExplodeSimulator3D: React.FC = () => {
  const [explodeHeight, setExplodeHeight] = useState<number>(6.5);
  const [showWater, setShowWater] = useState<boolean>(true);
  const [showGas, setShowGas] = useState<boolean>(true);
  const [showPower, setShowPower] = useState<boolean>(true);
  const [showFiber, setShowFiber] = useState<boolean>(true);
  const [showClash, setShowClash] = useState<boolean>(true);

  const handleSlider = (val: number) => {
    setExplodeHeight(val);
    if (val === 0 || val >= 8) {
      audioFX.playExplode();
    } else {
      audioFX.playHover();
    }
  };

  return (
    <div className="w-full bg-white border-2 border-black hard-shadow p-4 md:p-6 select-none font-mono">
      {/* Simulator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-black gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#dc0000] inline-block" />
          <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-black">
            INTERACTIVE 3D SUBTERRANEAN TRENCH SIMULATOR
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#666666]">VIEW:</span>
          <span className="bg-black text-white px-2 py-0.5 font-bold uppercase">
            3D ORBIT &amp; EXPLODE
          </span>
        </div>
      </div>

      {/* 3D Viewport Box */}
      <div className="relative w-full h-[380px] md:h-[480px] bg-[#0f172a] border border-black overflow-hidden hard-shadow-sm">
        <Canvas
          camera={{ position: [20, 18, 22], fov: 40 }}
          dpr={isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)}
          gl={{ antialias: !isSoftwareGl, powerPreference: 'high-performance' }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[15, 25, 20]} intensity={1.8} castShadow={!isSoftwareGl} />
          <pointLight position={[-15, 5, 0]} intensity={15} color="#00aaff" />
          <pointLight position={[15, 5, 0]} intensity={12} color="#ff8800" />

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2 + 0.15}
            minDistance={8}
            maxDistance={65}
          />

          <ExplodeModel
            explodeHeight={explodeHeight}
            showWater={showWater}
            showGas={showGas}
            showPower={showPower}
            showFiber={showFiber}
            showClash={showClash}
          />

          {!isSoftwareGl && (
            <ContactShadows
              position={[0, -3.4, 0]}
              opacity={0.6}
              scale={35}
              blur={1.8}
              far={15}
            />
          )}
        </Canvas>

        {/* Viewport Floating HUD Overlays */}
        <div className="absolute top-3 left-3 bg-white/95 border border-black px-2.5 py-1.5 hard-shadow-sm text-[10px] pointer-events-none">
          <div className="font-bold text-black uppercase">CORRIDOR ELEVATION:</div>
          <div className="text-[#dc0000] font-bold text-xs">
            {explodeHeight > 0.1 ? `+${explodeHeight.toFixed(1)}m VERTICAL EXPLODE` : 'SEALED SURFACE (0.0m)'}
          </div>
        </div>

        {showClash && (
          <div className="absolute top-3 right-3 bg-[#dc0000] text-white border border-black px-2.5 py-1.5 hard-shadow-sm text-[10px] pointer-events-none animate-pulse">
            <span className="font-bold">⚠️ SPATIAL CLASH: 0.18m</span>
            <div className="text-[9px] text-white/90">BWSSB WATER vs LATERAL</div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-black/80 text-white text-[9px] px-2 py-1 pointer-events-none">
          CLICK + DRAG TO ORBIT 360° | SCROLL TO ZOOM UNDER TRENCH
        </div>
      </div>

      {/* Simulator Control Dashboard */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#f8fafc] border border-black p-3.5">
        {/* Left: Explode Elevation Slider */}
        <div className="md:col-span-6 space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-black">
            <span>VERTICAL ROAD LIFT (EXPLODE):</span>
            <span className="bg-[#dc0000] text-white px-2 py-0.5">
              {explodeHeight.toFixed(1)}m
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="9.5"
            step="0.1"
            value={explodeHeight}
            onChange={(e) => handleSlider(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-300 accent-[#dc0000] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#666666]">
            <button
              onClick={() => handleSlider(0)}
              className="hover:text-black font-bold cursor-pointer"
            >
              [SEAL 0.0m]
            </button>
            <button
              onClick={() => handleSlider(4.5)}
              className="hover:text-black font-bold cursor-pointer"
            >
              [PARTIAL 4.5m]
            </button>
            <button
              onClick={() => handleSlider(9.0)}
              className="hover:text-black font-bold cursor-pointer"
            >
              [FULL EXPLODE 9.0m]
            </button>
          </div>
        </div>

        {/* Right: Layer Filters & Clash Toggle */}
        <div className="md:col-span-6 space-y-2">
          <div className="text-[10px] font-bold text-[#444444] uppercase">
            ACTIVE UTILITY LAYERS &amp; CLASH RADAR:
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setShowWater(!showWater);
                audioFX.playClick();
              }}
              className={`px-2 py-1 text-[10px] font-bold border border-black cursor-pointer flex items-center gap-1 ${
                showWater ? 'bg-[#00aaff] text-white' : 'bg-white text-black opacity-60'
              }`}
            >
              <span className="w-2 h-2 bg-white inline-block" />
              <span>BWSSB WATER</span>
            </button>

            <button
              onClick={() => {
                setShowGas(!showGas);
                audioFX.playClick();
              }}
              className={`px-2 py-1 text-[10px] font-bold border border-black cursor-pointer flex items-center gap-1 ${
                showGas ? 'bg-[#ff8800] text-white' : 'bg-white text-black opacity-60'
              }`}
            >
              <span className="w-2 h-2 bg-white inline-block" />
              <span>GAIL GAS</span>
            </button>

            <button
              onClick={() => {
                setShowPower(!showPower);
                audioFX.playClick();
              }}
              className={`px-2 py-1 text-[10px] font-bold border border-black cursor-pointer flex items-center gap-1 ${
                showPower ? 'bg-[#ff3300] text-white' : 'bg-white text-black opacity-60'
              }`}
            >
              <span className="w-2 h-2 bg-white inline-block" />
              <span>BESCOM 11kV</span>
            </button>

            <button
              onClick={() => {
                setShowFiber(!showFiber);
                audioFX.playClick();
              }}
              className={`px-2 py-1 text-[10px] font-bold border border-black cursor-pointer flex items-center gap-1 ${
                showFiber ? 'bg-[#ff00aa] text-white' : 'bg-white text-black opacity-60'
              }`}
            >
              <span className="w-2 h-2 bg-white inline-block" />
              <span>OFC FIBER</span>
            </button>

            <button
              onClick={() => {
                const next = !showClash;
                setShowClash(next);
                if (next) audioFX.playClashAlert();
                else audioFX.playClick();
              }}
              className={`px-2 py-1 text-[10px] font-bold border border-black cursor-pointer flex items-center gap-1 ${
                showClash ? 'bg-[#dc0000] text-white' : 'bg-white text-black'
              }`}
            >
              <span>{showClash ? '⚠️ CLASH RADAR ON' : 'CLASH RADAR OFF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
