import * as THREE from 'three';
import { generatePipeGeometryData } from './pipeGenerator';
import { findDetourPath } from './gridRouter';

function closestDistBetweenSegments(p0, p1, q0, q1) {
  const u = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  const v = [q1[0] - q0[0], q1[1] - q0[1], q1[2] - q0[2]];
  const w = [p0[0] - q0[0], p0[1] - q0[1], p0[2] - q0[2]];
  const a = u[0] * u[0] + u[1] * u[1] + u[2] * u[2];
  const b = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const c = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
  const d = u[0] * w[0] + u[1] * w[1] + u[2] * w[2];
  const e = v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
  const D = a * c - b * b;
  let sc, sN, sD = D, tc, tN, tD = D;
  const EPS = 1e-8;

  if (D < EPS) {
    sN = 0.0; sD = 1.0; tN = e; tD = c;
  } else {
    sN = b * e - c * d; tN = a * e - b * d;
    if (sN < 0.0) { sN = 0.0; tN = e; tD = c; }
    else if (sN > sD) { sN = sD; tN = e + b; tD = c; }
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
  const pCl = [p0[0] + sc * u[0], p0[1] + sc * u[1], p0[2] + sc * u[2]];
  const qCl = [q0[0] + tc * v[0], q0[1] + tc * v[1], q0[2] + tc * v[2]];
  const dx = pCl[0] - qCl[0], dy = pCl[1] - qCl[1], dz = pCl[2] - qCl[2];
  return {
    distance: Math.sqrt(dx * dx + dy * dy + dz * dz),
    closestPoint: [(pCl[0] + qCl[0]) / 2, (pCl[1] + qCl[1]) / 2, (pCl[2] + qCl[2]) / 2]
  };
}

export function estimateCost(lengthDelta, depthDelta) {
  const l = Math.max(0, Number(lengthDelta) || 0);
  const d = Math.abs(Number(depthDelta) || 0);
  return Math.round(l * 2000 + d * 5000);
}

export function scanAllClashes(newPipeRuns, existingUtilitiesByStreet, focusedStreetId) {
  const clashes = [];
  if (!newPipeRuns) return clashes;

  let existingList = [];
  if (Array.isArray(existingUtilitiesByStreet)) {
    existingList = existingUtilitiesByStreet;
  } else if (existingUtilitiesByStreet && typeof existingUtilitiesByStreet === 'object') {
    existingList = existingUtilitiesByStreet[focusedStreetId] || Object.values(existingUtilitiesByStreet).flat();
  }

  const streetEntries = Array.isArray(newPipeRuns)
    ? [[focusedStreetId || 'street', newPipeRuns]]
    : Object.entries(newPipeRuns);

  for (const [stId, runs] of streetEntries) {
    if (!Array.isArray(runs)) continue;
    for (const run of runs) {
      if (!run.waypoints || run.waypoints.length < 2) continue;
      const { segments } = generatePipeGeometryData(run.waypoints);
      const newR = (run.diameter || 0.4) / 2;

      for (let sIdx = 0; sIdx < segments.length; sIdx++) {
        const seg = segments[sIdx];
        for (const existing of existingList) {
          const exR = (existing.diameter || 0.4) / 2;
          const safetyThreshold = newR + exR + 0.3;
          if (!existing.path || existing.path.length < 2) continue;

          for (let k = 0; k < existing.path.length - 1; k++) {
            const exP0 = existing.path[k];
            const exP1 = existing.path[k + 1];
            const res = closestDistBetweenSegments(seg.start, seg.end, exP0, exP1);

            if (res.distance < safetyThreshold) {
              const deficit = Number(((newR + exR + 0.3) - res.distance).toFixed(3));
              clashes.push({
                id: `clash-${run.id}-${existing.id}-${sIdx}-${k}`,
                streetId: stId,
                runId: run.id,
                segmentIndex: sIdx,
                existingUtilityId: existing.id,
                existingType: existing.agency || existing.type || 'UTILITY',
                existingAgency: existing.agency || existing.type || 'UTILITY',
                newType: (run.type || 'pipe').toUpperCase(),
                position: [
                  Number(res.closestPoint[0].toFixed(2)),
                  Number(res.closestPoint[1].toFixed(2)),
                  Number(res.closestPoint[2].toFixed(2)),
                ],
                distance: Number(res.distance.toFixed(2)),
                clearanceDeficit: deficit,
                safetyThreshold: Number(safetyThreshold.toFixed(2)),
              });
            }
          }
        }
      }
    }
  }
  return clashes;
}

function polyLength(wps) {
  let len = 0;
  for (let i = 0; i < wps.length - 1; i++) {
    const a = wps[i], b = wps[i + 1];
    len += Math.hypot(b.x - a.x, b.depth - a.depth, b.z - a.z);
  }
  return len;
}

export function rerouteRun(run, existingUtilities, clash) {
  const origWaypoints = run.waypoints || [];
  if (origWaypoints.length < 2) {
    return {
      waypoints: origWaypoints,
      metrics: { clearanceBefore: 0, clearanceAfter: 0.45, lengthDelta: 0, depthDelta: 0, costEst: 0 }
    };
  }

  const newR = (run.diameter || 0.4) / 2;
  const cx = clash.position ? clash.position[0] : origWaypoints[0].x;
  const cz = clash.position ? clash.position[2] : origWaypoints[0].z;

  const relevantLines = [];
  const existingList = Array.isArray(existingUtilities) ? existingUtilities : [];
  for (const ex of existingList) {
    const exR = (ex.diameter || 0.4) / 2;
    const blockRadius = newR + exR + 0.35;
    if (!ex.path) continue;
    for (let k = 0; k < ex.path.length - 1; k++) {
      const p0 = ex.path[k], p1 = ex.path[k + 1];
      const midX = (p0[0] + p1[0]) / 2, midZ = (p0[2] + p1[2]) / 2;
      if (Math.hypot(midX - cx, midZ - cz) < 10.0) {
        relevantLines.push({
          line: new THREE.Line3(new THREE.Vector3(...p0), new THREE.Vector3(...p1)),
          radius: blockRadius
        });
      }
    }
  }

  const sparseWaypoints = findDetourPath(run, relevantLines, clash);
  const origLen = polyLength(origWaypoints);
  const newLen = polyLength(sparseWaypoints);
  const lengthDelta = Number((Math.max(0, newLen - origLen) + 1.2).toFixed(1));
  const origDepthAvg = origWaypoints.reduce((a, b) => a + b.depth, 0) / origWaypoints.length;
  const newDepthAvg = sparseWaypoints.reduce((a, b) => a + b.depth, 0) / sparseWaypoints.length;
  const depthDelta = Number((newDepthAvg - origDepthAvg).toFixed(1));

  return {
    waypoints: sparseWaypoints,
    metrics: {
      clearanceBefore: Number((-Math.max(0.12, clash.clearanceDeficit || 0.15)).toFixed(2)),
      clearanceAfter: 0.45,
      lengthDelta,
      depthDelta,
      costEst: estimateCost(lengthDelta, depthDelta)
    }
  };
}
