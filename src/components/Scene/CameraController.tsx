import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../../store';
import { getStreet, getArea } from '../../dataHelpers';
import { registerCameraAndControls } from '../../utils/cameraUtils';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { cityId, areaId, streetId, viewMode, exploded } = useStore();

  useEffect(() => {
    if (camera && controlsRef.current) {
      registerCameraAndControls(camera, controlsRef.current);
    }
  }, [camera]);

  // Smooth camera repositioning on street / area / topdown view change
  useEffect(() => {
    if (!controlsRef.current) return;

    if (viewMode === 'topdown') {
      gsap.to(camera.position, {
        x: 0,
        y: 60,
        z: 0.001,
        duration: 1.0,
        ease: 'power2.inOut',
      });

      gsap.to(controlsRef.current.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.0,
        ease: 'power2.inOut',
      });
    } else if (viewMode === 'area') {
      const area = getArea(cityId, areaId);
      // Area encompasses all 3 streets: origins [0,0,0], [180,0,0], [360,0,0]
      const centerX = 180;
      const centerZ = 0;
      const targetPos = new THREE.Vector3(centerX + 180, 240, centerZ + 280);
      const targetLook = new THREE.Vector3(centerX, exploded ? 4.0 : 0.0, centerZ);

      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 0.8,
        ease: 'power2.out',
      });

      gsap.to(controlsRef.current.target, {
        x: targetLook.x,
        y: targetLook.y,
        z: targetLook.z,
        duration: 0.8,
        ease: 'power2.out',
      });
    } else {
      const street = getStreet(cityId, areaId, streetId);
      const [cx, , cz] = street.origin;
      const dist = 45;
      const targetPos = new THREE.Vector3(cx + dist * 0.6, dist * 0.7 + 10, cz + dist);
      const targetLook = new THREE.Vector3(cx, exploded ? 4.0 : 0.0, cz);

      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 0.8,
        ease: 'power2.out',
      });

      gsap.to(controlsRef.current.target, {
        x: targetLook.x,
        y: targetLook.y,
        z: targetLook.z,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, [streetId, viewMode, areaId, cityId, camera]);

  // Target Y follows exploded road
  useEffect(() => {
    if (!controlsRef.current) return;
    const targetY = exploded ? 4.0 : 0.0;
    gsap.to(controlsRef.current.target, {
      y: targetY,
      duration: 1.2,
      ease: 'power3.inOut',
    });
  }, [exploded]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2 + 0.1} // Allow looking slightly under road
      minDistance={5}
      maxDistance={600}
    />
  );
};
