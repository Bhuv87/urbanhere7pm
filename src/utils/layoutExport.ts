import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import * as THREE from 'three';

let registeredLayoutGroup: THREE.Group | null = null;

export function registerLayoutGroup(group: THREE.Group | null) {
  registeredLayoutGroup = group;
}

export function getRegisteredLayoutGroup(): THREE.Group | null {
  return registeredLayoutGroup;
}

/**
 * Exports the 3D layout items as a binary .glb file using Three.js GLTFExporter
 * and automatically triggers browser download.
 */
export function exportLayoutToGLB(filename?: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!registeredLayoutGroup || registeredLayoutGroup.children.length === 0) {
      resolve(false);
      return;
    }

    try {
      const exporter = new GLTFExporter();
      const exportGroup = new THREE.Group();
      exportGroup.name = 'Bengaluru_Custom_Area_Layout';

      // Clone children to isolate from live scene graph & prevent modifying scene state
      registeredLayoutGroup.children.forEach((child) => {
        // Skip helper/gizmo objects if any accidentally attached to group
        if (child.name !== 'TransformGizmoRoot' && !(child as any).isTransformControls) {
          exportGroup.add(child.clone(true));
        }
      });

      const actualFilename =
        filename || `custom-layout-${new Date().toISOString().slice(0, 10)}.glb`;

      exporter.parse(
        exportGroup,
        (gltf) => {
          try {
            const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = actualFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            resolve(true);
          } catch (blobErr) {
            console.error('Failed to create or download GLB blob:', blobErr);
            reject(blobErr);
          }
        },
        (error) => {
          console.error('GLTFExporter failed during parse:', error);
          reject(error);
        },
        { binary: true }
      );
    } catch (err) {
      console.error('Error initiating GLTF export:', err);
      reject(err);
    }
  });
}
