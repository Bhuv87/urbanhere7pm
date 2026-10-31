import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { registerCameraAndControls, flyToTopDown, flyTo3D } from '../utils/cameraUtils';

export { flyToTopDown, flyTo3D };

export function useCameraFit(controlsRef?: React.RefObject<any>) {
  const { camera } = useThree();

  useEffect(() => {
    if (camera && controlsRef?.current) {
      registerCameraAndControls(camera, controlsRef.current);
    }
  }, [camera, controlsRef]);

  return { flyToTopDown, flyTo3D };
}
