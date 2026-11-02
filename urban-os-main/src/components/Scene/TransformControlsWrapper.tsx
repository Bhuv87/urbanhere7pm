import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import * as THREE from 'three';
import { getRegisteredControls } from '../../utils/cameraUtils';
import { LayoutTransformMode } from '../../types/layout';

interface Props {
  target: THREE.Object3D | null;
  mode: LayoutTransformMode;
  onTransformChange?: (object: THREE.Object3D) => void;
  onTransformEnd?: (object: THREE.Object3D) => void;
}

export const TransformControlsWrapper: React.FC<Props> = ({
  target,
  mode,
  onTransformChange,
  onTransformEnd,
}) => {
  const { camera, gl, scene, invalidate } = useThree();
  const controlsRef = useRef<TransformControls | null>(null);

  useEffect(() => {
    const controls = new TransformControls(camera, gl.domElement);
    controlsRef.current = controls;

    // In modern Three.js, controls.getHelper() returns the gizmo Object3D
    const helper = typeof controls.getHelper === 'function' ? controls.getHelper() : (controls as unknown as THREE.Object3D);
    helper.name = 'TransformGizmoRoot';
    scene.add(helper);

    const onDraggingChanged = (event: any) => {
      const orbit = getRegisteredControls();
      if (orbit) {
        orbit.enabled = !event.value;
      }
      if (!event.value && controls.object && onTransformEnd) {
        onTransformEnd(controls.object);
      }
      invalidate();
    };

    const onChange = () => {
      invalidate();
    };

    const onObjectChange = () => {
      if (controls.object && onTransformChange) {
        onTransformChange(controls.object);
      }
      invalidate();
    };

    controls.addEventListener('dragging-changed', onDraggingChanged);
    controls.addEventListener('change', onChange);
    controls.addEventListener('objectChange', onObjectChange);

    return () => {
      controls.removeEventListener('dragging-changed', onDraggingChanged);
      controls.removeEventListener('change', onChange);
      controls.removeEventListener('objectChange', onObjectChange);
      controls.detach();
      scene.remove(helper);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, scene, invalidate]);

  // Sync attached target
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (target) {
      controls.attach(target);
    } else {
      controls.detach();
    }
    invalidate();
  }, [target, invalidate]);

  // Sync transformation mode ('translate' | 'rotate' | 'scale')
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.setMode(mode);
    invalidate();
  }, [mode, invalidate]);

  return null;
};
