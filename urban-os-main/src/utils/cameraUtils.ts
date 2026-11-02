import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store';
import { getStreet } from '../dataHelpers';

let registeredCamera: THREE.Camera | null = null;
let registeredControls: any = null;

export function registerCameraAndControls(camera: THREE.Camera, controls: any) {
  registeredCamera = camera;
  registeredControls = controls;
}

export function getRegisteredControls() {
  return registeredControls;
}

export function getRegisteredCamera() {
  return registeredCamera;
}

export function flyToTopDown() {
  const store = useStore.getState();
  store.setViewMode('topdown');

  if (registeredCamera && registeredControls) {
    gsap.killTweensOf(registeredCamera.position);
    gsap.killTweensOf(registeredControls.target);

    gsap.to(registeredCamera.position, {
      x: 0,
      y: 60,
      z: 0.001,
      duration: 1.0,
      ease: 'power2.inOut',
    });

    gsap.to(registeredControls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.0,
      ease: 'power2.inOut',
    });
  }
}

export function flyTo3D() {
  const store = useStore.getState();
  store.setViewMode('3d');

  if (registeredCamera && registeredControls) {
    const street = getStreet(store.cityId, store.areaId, store.streetId);
    const [cx, , cz] = street.origin;
    const dist = 45;

    gsap.killTweensOf(registeredCamera.position);
    gsap.killTweensOf(registeredControls.target);

    gsap.to(registeredCamera.position, {
      x: cx + dist * 0.6,
      y: dist * 0.7 + 10,
      z: cz + dist,
      duration: 1.0,
      ease: 'power2.inOut',
    });

    gsap.to(registeredControls.target, {
      x: cx,
      y: store.exploded ? 4.0 : 0.0,
      z: cz,
      duration: 1.0,
      ease: 'power2.inOut',
    });
  }
}
