import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { isSoftwareGl } from '../../utils/softwareGl';
import { audioFX } from './AudioFX';

const InteractiveCorridorMesh: React.FC<{ exploded: boolean }> = ({ exploded }) => {
  const roadRef = useRef<THREE.Group>(null);
  const clashRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const targetY = exploded ? 4.5 : 0;
    if (roadRef.current) {
      roadRef.current.position.y += (targetY - roadRef.current.position.y) * 0.08;
    }
    if (clashRef.current) {
      const s = 1.0 + Math.sin(clock.getElapsedTime() * 7) * 0.18;
      clashRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* 1. SURFACE ROAD DECK (Lifts when exploded) */}
      <group ref={roadRef} position={[0, 0, 0]}>
        {/* Asphalt Road */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[18, 0.35, 6]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* Yellow Central Highway Stripe */}
        <mesh position={[0, 0.19, 0]}>
          <boxGeometry args={[17.6, 0.02, 0.2]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        {/* North and South Sidewalks */}
        <mesh position={[0, 0.08, 3.6]} receiveShadow>
          <boxGeometry args={[18, 0.45, 1.2]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.08, -3.6]} receiveShadow>
          <boxGeometry args={[18, 0.45, 1.2]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.9} />
        </mesh>

        {/* Bengaluru Nilaya Modern Duplex on North Plot */}
        <group position={[-3.5, 0.25, -6.0]}>
          <mesh castShadow receiveShadow position={[0, 2.5, 0]}>
            <boxGeometry args={[5.2, 5.0, 4.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.6} />
          </mesh>
          {/* Balcony */}
          <mesh position={[0, 3.2, 2.7]} castShadow>
            <boxGeometry args={[4.2, 0.2, 1.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Glass Railing */}
          <mesh position={[0, 3.6, 3.2]}>
            <boxGeometry args={[4.2, 0.7, 0.05]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        </group>

        {/* Commercial Complex on South Plot */}
        <group position={[4.0, 0.25, -6.0]}>
          <mesh castShadow receiveShadow position={[0, 3.2, 0]}>
            <boxGeometry args={[5.8, 6.4, 4.8]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
          </mesh>
          {/* Glazing */}
          <mesh position={[0, 3.2, 2.45]}>
            <boxGeometry args={[5.2, 5.0, 0.08]} />
            <meshStandardMaterial color="#0284c7" transparent opacity={0.65} />
          </mesh>
        </group>
      </group>

      {/* 2. SUBTERRANEAN BEDROCK & PIPELINES (Always anchored in trench) */}
      <group position={[0, -2.4, 0]}>
        {/* Trench Bed Foundation */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[19, 0.35, 7.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>

        {/* Trench Shoring Walls */}
        <mesh position={[0, 1.2, -3.9]} receiveShadow>
          <boxGeometry args={[19, 2.4, 0.25]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.2, 3.9]} receiveShadow>
          <boxGeometry args={[19, 2.4, 0.25]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>

        {/* BWSSB Water Main (-2.5m, 0.8m Dia Azure Blue) */}
        <mesh position={[0, 0.6, -1.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 18.5, 20]} />
          <meshStandardMaterial color="#00aaff" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* GAIL Gas Pipeline (-1.8m, 0.45m Safety Amber) */}
        <mesh position={[0, 1.1, 1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 18.5, 20]} />
          <meshStandardMaterial color="#ff8800" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* BESCOM 11kV Power Feeder (-1.4m, 0.35m Red) */}
        <mesh position={[0, 1.4, -0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 18.5, 16]} />
          <meshStandardMaterial color="#ff3300" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Telecom OFC Fiber Conduit (-1.0m, 0.2m Magenta) */}
        <mesh position={[0, 1.7, 2.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 18.5, 16]} />
          <meshStandardMaterial color="#ff00aa" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Flashing Spatial Clash Torus Halo */}
        <group ref={clashRef} position={[2.0, 0.8, -1.8]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.7, 0.08, 12, 24]} />
            <meshBasicMaterial color="#dc0000" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshBasicMaterial color="#ff2200" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export const WindowPreview3D: React.FC = () => {
  const [exploded, setExploded] = useState(true);

  const handleToggle = () => {
    audioFX.playExplode();
    setExploded(!exploded);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#141822] select-none font-mono">
      {/* 3D Canvas Box */}
      <div className="relative flex-1 w-full min-h-[300px] sm:min-h-[380px] overflow-hidden">
        <Canvas
          camera={{ position: [15, 12, 18], fov: 38 }}
          dpr={isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)}
          gl={{ antialias: !isSoftwareGl, powerPreference: 'high-performance' }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[12, 20, 15]} intensity={1.8} castShadow={!isSoftwareGl} />
          <pointLight position={[-10, 4, -8]} intensity={8} color="#00aaff" />
          <pointLight position={[10, 4, 8]} intensity={8} color="#ff8800" />

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            autoRotate
            autoRotateSpeed={0.8}
            maxPolarAngle={Math.PI / 2 + 0.1}
            minDistance={8}
            maxDistance={45}
          />

          <InteractiveCorridorMesh exploded={exploded} />

          {!isSoftwareGl && (
            <ContactShadows
              position={[0, -2.8, 0]}
              opacity={0.5}
              scale={28}
              blur={1.5}
              far={10}
            />
          )}
        </Canvas>

        {/* Floating In-Window HUD Overlay */}
        <div className="absolute top-2.5 left-2.5 bg-black/85 border border-white/20 text-white text-[10px] px-2 py-1 pointer-events-none">
          <span className="text-[#00aaff] font-bold">UTTARAHALLI MAIN</span> ·{' '}
          <span className={exploded ? 'text-[#dc0000] font-bold' : 'text-[#00cc66]'}>
            {exploded ? 'EXPLODED (4.5m)' : 'SEALED'}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5 bg-[#dc0000] text-white border border-black text-[9px] font-bold px-2 py-0.5 pointer-events-none animate-pulse">
          ⚠ CLASH DETECTED: 0.18m
        </div>
      </div>

      {/* Bottom Control Bar of Window */}
      <div className="p-2 sm:p-3 bg-black border-t-2 border-black flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#00aaff]" /> Water
          <span className="w-2 h-2 rounded-full bg-[#ff8800] ml-1" /> Gas
          <span className="w-2 h-2 rounded-full bg-[#ff3300] ml-1" /> Power
          <span className="w-2 h-2 rounded-full bg-[#ff00aa] ml-1" /> Fiber
        </div>

        <button
          onClick={handleToggle}
          className="bg-white text-black hover:bg-slate-200 border border-black px-2.5 py-1 text-[10px] font-bold uppercase transition-none cursor-pointer"
        >
          {exploded ? 'Collapse Road' : '▲ Explode Trench'}
        </button>
      </div>
    </div>
  );
};
