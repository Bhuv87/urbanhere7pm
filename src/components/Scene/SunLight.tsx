import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { calculateSunPosition } from '../../utils/solar';

export const SunLight: React.FC = () => {
  const { solarTime } = useStore();
  const lightRef = useRef<THREE.DirectionalLight>(null);

  const sun = useMemo(() => {
    return calculateSunPosition(solarTime, 120);
  }, [solarTime]);

  return (
    <group>
      {/* Directional Sun Light */}
      <directionalLight
        ref={lightRef}
        position={[sun.x, sun.y, sun.z]}
        intensity={sun.intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={10}
        shadow-camera-far={300}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0005}
      />

      {/* Subtle ambient light for CAD visibility */}
      <ambientLight intensity={0.5} />

      {/* Hemisphere sky/ground fill */}
      <hemisphereLight
        color="#e0f2fe"
        groundColor="#334155"
        intensity={0.4}
      />
    </group>
  );
};
