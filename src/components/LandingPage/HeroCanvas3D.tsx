import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isSoftwareGl } from '../../utils/softwareGl';

// Interactive Particle Cloud with mouse attractor
const ParticleMatrix: React.FC<{ mousePos: React.MutableRefObject<{ x: number; y: number }> }> = ({ mousePos }) => {
  const count = isSoftwareGl ? 400 : 1200;
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particle positions and colors matching Bengaluru's 4 utility streams
  const [positions, colors, originalPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orig = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    // 4 Utility colors: Blue (Water), Amber (Gas), Magenta (Fiber), Red (Power)
    const palette = [
      new THREE.Color('#00aaff'),
      new THREE.Color('#ff8800'),
      new THREE.Color('#ff00aa'),
      new THREE.Color('#ff3300'),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < count; i++) {
      const radius = 6 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 14;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col, orig];
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    const mx = mousePos.current.x * 12;
    const my = mousePos.current.y * 8;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Base orbital drift
      const origX = originalPositions[ix];
      const origY = originalPositions[iy];
      const origZ = originalPositions[iz];

      const angle = 0.15 * t + i * 0.02;
      const wave = Math.sin(t * 1.5 + origX * 0.2) * 0.4;

      // Target position
      let tx = origX * Math.cos(angle * 0.3) - origZ * Math.sin(angle * 0.3);
      let ty = origY + wave;
      let tz = origX * Math.sin(angle * 0.3) + origZ * Math.cos(angle * 0.3);

      // Subtle mouse attraction
      const dx = mx - tx;
      const dy = my - ty;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 8) {
        const force = (8 - dist) * 0.12;
        tx += (dx / dist) * force;
        ty += (dy / dist) * force;
      }

      // Smooth lerp
      arr[ix] += (tx - arr[ix]) * 0.08;
      arr[iy] += (ty - arr[iy]) * 0.08;
      arr[iz] += (tz - arr[iz]) * 0.08;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Central Holographic Subterranean Digital Core
const SubterraneanCore: React.FC<{ mousePos: React.MutableRefObject<{ x: number; y: number }> }> = ({ mousePos }) => {
  const groupRef = useRef<THREE.Group>(null);
  const roadSlabRef = useRef<THREE.Mesh>(null);
  const pipeRingRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Mouse parallax rotation
    const targetRotY = mousePos.current.x * 0.6 + t * 0.12;
    const targetRotX = -mousePos.current.y * 0.4 + 0.35;

    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;

    // Levitation breathing
    if (roadSlabRef.current) {
      roadSlabRef.current.position.y = 2.4 + Math.sin(t * 1.8) * 0.35;
    }

    if (pipeRingRef.current) {
      pipeRingRef.current.rotation.y = -t * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* 1. Exploded Road Surface Slab (Hovering with levitation) */}
      <group ref={roadSlabRef} position={[0, 2.4, 0]}>
        {/* Asphalt Road Plane */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[14, 0.35, 7]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
        {/* Yellow Central Highway Stripe */}
        <mesh position={[0, 0.19, 0]}>
          <boxGeometry args={[13.6, 0.02, 0.25]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        {/* Cyan CAD Alignment Laser Border */}
        <mesh position={[0, 0.2, 3.45]}>
          <boxGeometry args={[14, 0.02, 0.06]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
        <mesh position={[0, 0.2, -3.45]}>
          <boxGeometry args={[14, 0.02, 0.06]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>

        {/* Floating Building Wireframe Block on Road Surface */}
        <group position={[-3.5, 1.8, -1.2]}>
          <mesh>
            <boxGeometry args={[3.6, 3.2, 3.0]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.7} wireframe />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[3.4, 3.0, 2.8]} />
            <meshStandardMaterial color="#0284c7" transparent opacity={0.25} roughness={0.1} />
          </mesh>
        </group>

        {/* Second Architectural Tower on Right */}
        <group position={[3.6, 2.2, 0.8]}>
          <mesh>
            <boxGeometry args={[3.2, 4.0, 3.2]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.8} wireframe />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[3.0, 3.8, 3.0]} />
            <meshStandardMaterial color="#dc0000" transparent opacity={0.2} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* 2. Subterranean Infrastructure Trench Base (-Y Bedding) */}
      <group position={[0, -2.2, 0]}>
        {/* Trench Earth Bed */}
        <mesh receiveShadow>
          <boxGeometry args={[15, 0.5, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        {/* Wireframe Matrix on Trench Floor */}
        <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14.8, 7.8, 16, 8]} />
          <meshBasicMaterial color="#334155" wireframe transparent opacity={0.6} />
        </mesh>

        {/* Actual 3D Utility Conduit Network */}
        {/* BWSSB Water Main (0.8m Blue) */}
        <mesh position={[0, 0.8, -1.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 14.5, 20]} />
          <meshStandardMaterial color="#00aaff" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* GAIL Gas Line (0.5m Amber) */}
        <mesh position={[0, 1.3, 1.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 14.5, 20]} />
          <meshStandardMaterial color="#ff8800" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* BESCOM 11kV Power Feeder (0.4m Red) */}
        <mesh position={[0, 1.7, -0.4]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 14.5, 20]} />
          <meshStandardMaterial color="#ff3300" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Telecom Optical Fiber Trunk (0.25m Magenta) */}
        <mesh position={[0, 2.0, 2.6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 14.5, 20]} />
          <meshStandardMaterial color="#ff00aa" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Pulsing Clash Detection Halo at Intersection */}
        <group position={[0.5, 1.5, 0.5]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.8, 0.08, 12, 24]} />
            <meshBasicMaterial color="#dc0000" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshBasicMaterial color="#ff3300" />
          </mesh>
        </group>
      </group>

      {/* 3. Orbiting Data Gyro Rings */}
      <group ref={pipeRingRef} position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[9.5, 0.03, 8, 48]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.45} />
        </mesh>
        <mesh rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[10.2, 0.025, 8, 48]} />
          <meshBasicMaterial color="#dc0000" transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
};

export const HeroCanvas3D: React.FC = () => {
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize -1 to 1
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 4.5, 16], fov: 42 }}
        dpr={isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: !isSoftwareGl, powerPreference: 'high-performance', alpha: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 15]} intensity={1.8} castShadow={!isSoftwareGl} />
        <pointLight position={[-12, -4, -10]} intensity={2.5} color="#00aaff" />
        <pointLight position={[12, -4, 10]} intensity={2.0} color="#ff3300" />

        <SubterraneanCore mousePos={mousePos} />
        <ParticleMatrix mousePos={mousePos} />
      </Canvas>
      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette opacity-30 pointer-events-none" />
    </div>
  );
};
