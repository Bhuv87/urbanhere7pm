import { Utility } from '../dataHelpers';
import { generatePipeGeometryData } from './pipeGenerator';

export interface PlacedPipeRun {
  id: string;
  type: 'water' | 'gas' | 'fiber' | 'power';
  color: string;
  diameter: number;
  defaultDepth: number;
  waypoints: { x: number; z: number; depth: number }[];
  status?: 'draft' | 'committed';
}

export interface ClashResult {
  id: string;
  position: [number, number, number];
  distance: number;
  safetyThreshold: number;
  existingId: string;
  existingAgency: string;
  newId: string;
  newType: string;
}

// Distance between two 3D line segments S1(P0, P1) and S2(Q0, Q1)
function closestDistanceBetweenSegments(
  p0: [number, number, number],
  p1: [number, number, number],
  q0: [number, number, number],
  q1: [number, number, number]
): { distance: number; closestPoint: [number, number, number] } {
  const u = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  const v = [q1[0] - q0[0], q1[1] - q0[1], q1[2] - q0[2]];
  const w = [p0[0] - q0[0], p0[1] - q0[1], p0[2] - q0[2]];

  const a = u[0] * u[0] + u[1] * u[1] + u[2] * u[2]; // dot(u, u)
  const b = u[0] * v[0] + u[1] * v[1] + u[2] * v[2]; // dot(u, v)
  const c = v[0] * v[0] + v[1] * v[1] + v[2] * v[2]; // dot(v, v)
  const d = u[0] * w[0] + u[1] * w[1] + u[2] * w[2]; // dot(u, w)
  const e = v[0] * w[0] + v[1] * w[1] + v[2] * w[2]; // dot(v, w)

  const D = a * c - b * b;
  let sc = 0;
  let sN = 0;
  let sD = D;
  let tc = 0;
  let tN = 0;
  let tD = D;

  const EPS = 0.00000001;

  if (D < EPS) {
    sN = 0.0;
    sD = 1.0;
    tN = e;
    tD = c;
  } else {
    sN = b * e - c * d;
    tN = a * e - b * d;
    if (sN < 0.0) {
      sN = 0.0;
      tN = e;
      tD = c;
    } else if (sN > sD) {
      sN = sD;
      tN = e + b;
      tD = c;
    }
  }

  if (tN < 0.0) {
    tc = 0.0;
    if (-d < 0.0) sc = 0.0;
    else if (-d > a) sc = 1.0;
    else sc = -d / a;
  } else if (tN > tD) {
    tc = 1.0;
    if (-d + b < 0.0) sc = 0.0;
    else if (-d + b > a) sc = 1.0;
    else sc = (-d + b) / a;
  } else {
    tc = Math.abs(tN) < EPS ? 0.0 : tN / tD;
    sc = Math.abs(sN) < EPS ? 0.0 : sN / sD;
  }

  // Points on each segment
  const pClosest: [number, number, number] = [
    p0[0] + sc * u[0],
    p0[1] + sc * u[1],
    p0[2] + sc * u[2],
  ];

  const qClosest: [number, number, number] = [
    q0[0] + tc * v[0],
    q0[1] + tc * v[1],
    q0[2] + tc * v[2],
  ];

  const dx = pClosest[0] - qClosest[0];
  const dy = pClosest[1] - qClosest[1];
  const dz = pClosest[2] - qClosest[2];
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const midPoint: [number, number, number] = [
    (pClosest[0] + qClosest[0]) / 2,
    (pClosest[1] + qClosest[1]) / 2,
    (pClosest[2] + qClosest[2]) / 2,
  ];

  return { distance, closestPoint: midPoint };
}

/**
 * Detects 3D spatial clashes between new pipe runs and pre-existing utilities
 */
export function findClashes(
  existingUtilities: Utility[],
  newRuns: PlacedPipeRun[]
): ClashResult[] {
  const clashes: ClashResult[] = [];
  if (!existingUtilities || !newRuns) return clashes;

  for (const run of newRuns) {
    if (run.waypoints.length < 2) continue;
    const { segments } = generatePipeGeometryData(run.waypoints);
    const newRadius = (run.diameter || 0.4) / 2;

    for (const segment of segments) {
      for (const existing of existingUtilities) {
        const existingRadius = (existing.diameter || 0.4) / 2;
        const safetyThreshold = newRadius + existingRadius + 0.3; // 0.3m safety clearance

        // Check each sub-segment of the existing utility path
        for (let k = 0; k < existing.path.length - 1; k++) {
          const exP0 = existing.path[k];
          const exP1 = existing.path[k + 1];

          const res = closestDistanceBetweenSegments(
            segment.start,
            segment.end,
            exP0,
            exP1
          );

          if (res.distance < safetyThreshold) {
            clashes.push({
              id: `clash-${run.id}-${existing.id}-${segment.id}-${k}`,
              position: res.closestPoint,
              distance: parseFloat(res.distance.toFixed(2)),
              safetyThreshold: parseFloat(safetyThreshold.toFixed(2)),
              existingId: existing.id,
              existingAgency: existing.agency,
              newId: run.id,
              newType: run.type.toUpperCase(),
            });
          }
        }
      }
    }
  }

  return clashes;
}
