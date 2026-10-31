export interface Waypoint {
  x: number;
  z: number;
  depth: number; // positive number in meters below ground
}

export interface PipeSegmentData {
  id: string;
  type: 'horizontal' | 'vertical';
  start: [number, number, number];
  end: [number, number, number];
  mid: [number, number, number];
  length: number;
  direction: [number, number, number];
}

export interface PipeElbowData {
  id: string;
  corner: [number, number, number];
  inDir: [number, number, number];
  outDir: [number, number, number];
}

export interface PipeFlangeData {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
}

export interface GeneratedPipeMeshModel {
  segments: PipeSegmentData[];
  elbows: PipeElbowData[];
  flanges: PipeFlangeData[];
}

function normalize3D(x: number, y: number, z: number): [number, number, number] {
  const len = Math.sqrt(x * x + y * y + z * z) || 1;
  return [x / len, y / len, z / len];
}

/**
 * Computes segments, transitions, elbows, and flanges from an ordered set of waypoints
 */
export function generatePipeGeometryData(waypoints: Waypoint[]): GeneratedPipeMeshModel {
  const segments: PipeSegmentData[] = [];
  const elbows: PipeElbowData[] = [];
  const flanges: PipeFlangeData[] = [];

  if (!waypoints || waypoints.length < 2) {
    return { segments, elbows, flanges };
  }

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];

    const depthDiff = Math.abs(a.depth - b.depth);

    if (depthDiff < 0.01) {
      // Direct horizontal segment
      const start: [number, number, number] = [a.x, -a.depth, a.z];
      const end: [number, number, number] = [b.x, -b.depth, b.z];
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const dz = end[2] - start[2];
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (length > 0.05) {
        const dir = normalize3D(dx, dy, dz);
        const mid: [number, number, number] = [
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2,
          (start[2] + end[2]) / 2,
        ];

        segments.push({
          id: `seg-h-${i}`,
          type: 'horizontal',
          start,
          end,
          mid,
          length,
          direction: dir,
        });

        // Add flange at start if first segment
        if (i === 0) {
          flanges.push({
            id: `flange-start-${i}`,
            position: start,
            direction: dir,
          });
        }
        // Add flange at end if last segment
        if (i === waypoints.length - 2) {
          flanges.push({
            id: `flange-end-${i}`,
            position: end,
            direction: dir,
          });
        }
      }
    } else {
      // Depth changed: vertical segment at A from a.depth -> b.depth, then elbow at (a.x, -b.depth, a.z), then H from A -> B
      const vStart: [number, number, number] = [a.x, -a.depth, a.z];
      const vEnd: [number, number, number] = [a.x, -b.depth, a.z];
      const vLength = Math.abs(b.depth - a.depth);
      const vDirY = b.depth > a.depth ? -1 : 1;
      const vDir: [number, number, number] = [0, vDirY, 0];
      const vMid: [number, number, number] = [a.x, -(a.depth + b.depth) / 2, a.z];

      segments.push({
        id: `seg-v-${i}`,
        type: 'vertical',
        start: vStart,
        end: vEnd,
        mid: vMid,
        length: vLength,
        direction: vDir,
      });

      if (i === 0) {
        flanges.push({
          id: `flange-v-start-${i}`,
          position: vStart,
          direction: vDir,
        });
      }

      // Horizontal segment at depth b.depth
      const hStart: [number, number, number] = [a.x, -b.depth, a.z];
      const hEnd: [number, number, number] = [b.x, -b.depth, b.z];
      const dx = hEnd[0] - hStart[0];
      const dz = hEnd[2] - hStart[2];
      const hLength = Math.sqrt(dx * dx + dz * dz);

      if (hLength > 0.05) {
        const hDir = normalize3D(dx, 0, dz);
        const hMid: [number, number, number] = [
          (hStart[0] + hEnd[0]) / 2,
          -b.depth,
          (hStart[2] + hEnd[2]) / 2,
        ];

        // Elbow at transition
        elbows.push({
          id: `elbow-vh-${i}`,
          corner: [a.x, -b.depth, a.z],
          inDir: [0, -vDirY, 0],
          outDir: hDir,
        });

        segments.push({
          id: `seg-h-${i}`,
          type: 'horizontal',
          start: hStart,
          end: hEnd,
          mid: hMid,
          length: hLength,
          direction: hDir,
        });

        if (i === waypoints.length - 2) {
          flanges.push({
            id: `flange-end-${i}`,
            position: hEnd,
            direction: hDir,
          });
        }
      }
    }

    // Check elbow between previous horizontal segment and this one
    if (i > 0 && segments.length >= 2) {
      const prev = segments[segments.length - 2];
      const curr = segments[segments.length - 1];
      if (prev.type === 'horizontal' && curr.type === 'horizontal') {
        // Corner elbow
        elbows.push({
          id: `elbow-hh-${i}`,
          corner: curr.start,
          inDir: [-prev.direction[0], -prev.direction[1], -prev.direction[2]],
          outDir: curr.direction,
        });
      }
    }
  }

  return { segments, elbows, flanges };
}
