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
          if (run.connectedMainId === existing.id) continue;
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
  return generatePipeGeometryData(wps).segments.reduce((length, segment) => length + segment.length, 0);
}

export function measureMinimumClearance(runs, existingUtilities) {
  let minimum = Infinity;
  for (const run of runs) {
    if (!run.waypoints || run.waypoints.length < 2) continue;
    for (const segment of generatePipeGeometryData(run.waypoints).segments) {
      for (const existing of existingUtilities) {
        if (run.connectedMainId === existing.id || !existing.path) continue;
        for (let i = 0; i < existing.path.length - 1; i++) {
          const result = closestDistBetweenSegments(
            segment.start, segment.end, existing.path[i], existing.path[i + 1]);
          minimum = Math.min(minimum,
            result.distance - ((run.diameter || 0.4) + (existing.diameter || 0.4)) / 2);
        }
      }
    }
  }
  return Number.isFinite(minimum) ? Number(minimum.toFixed(2)) : null;
}

function collisionScore(run, existingUtilities) {
  const clashes = scanAllClashes([run], existingUtilities, 'candidate');
  return clashes.length * 10 + clashes.reduce((score, clash) => score + clash.clearanceDeficit, 0);
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
      const line = new THREE.Line3(new THREE.Vector3(...p0), new THREE.Vector3(...p1));
      const near = new THREE.Vector3();
      line.closestPointToPoint(new THREE.Vector3(cx, clash.position?.[1] ?? -2, cz), true, near);
      if (Math.hypot(near.x - cx, near.z - cz) < 10.0) {
        relevantLines.push({
          line,
          radius: blockRadius
        });
      }
    }
  }

  // Route only the local span around the clash. This preserves the remaining
  // hand-drawn waypoints and keeps the voxel search bounded on long streets.
  const clashPoint = new THREE.Vector3(...(clash.position || [cx, -origWaypoints[0].depth, cz]));
  let segmentIndex = 0;
  let nearestDistance = Infinity;
  for (let i = 0; i < origWaypoints.length - 1; i++) {
    const a = origWaypoints[i], b = origWaypoints[i + 1];
    const line = new THREE.Line3(
      new THREE.Vector3(a.x, -a.depth, a.z),
      new THREE.Vector3(b.x, -b.depth, b.z),
    );
    const near = new THREE.Vector3();
    line.closestPointToPoint(clashPoint, true, near);
    const distance = near.distanceToSquared(clashPoint);
    if (distance < nearestDistance) { nearestDistance = distance; segmentIndex = i; }
  }
  const a = origWaypoints[segmentIndex], b = origWaypoints[segmentIndex + 1];
  const dx = b.x - a.x, dz = b.z - a.z, dd = b.depth - a.depth;
  const lengthSq = dx * dx + dz * dz + dd * dd;
  const length = Math.sqrt(lengthSq);
  const t = lengthSq > 0
    ? Math.max(0, Math.min(1, ((cx - a.x) * dx + (cz - a.z) * dz + (-clashPoint.y - a.depth) * dd) / lengthSq))
    : 0.5;
  const entryT = Math.max(0, t - 6 / (length || 1));
  const exitT = Math.min(1, t + 6 / (length || 1));
  const interpolate = (fraction) => ({
    x: a.x + dx * fraction,
    z: a.z + dz * fraction,
    depth: a.depth + dd * fraction,
  });
  const localWaypoints = [interpolate(entryT), interpolate(exitT)];
  const makeFullRoute = (localPath) => [
    ...origWaypoints.slice(0, segmentIndex + 1),
    ...localPath,
    ...origWaypoints.slice(segmentIndex + 1),
  ].filter((wp, i, all) => i === 0 ||
    Math.hypot(wp.x - all[i - 1].x, wp.z - all[i - 1].z, wp.depth - all[i - 1].depth) > 0.05);
  const originalScore = collisionScore(run, existingList);
  let bestRoute = null;
  let bestScore = originalScore;
  let bestCost = Infinity;
  const consider = (localPath) => {
    const route = makeFullRoute(localPath);
    const score = collisionScore({ ...run, waypoints: route }, existingList);
    const extraLength = Math.max(0, polyLength(route) - polyLength(origWaypoints));
    const cost = extraLength + localPath.length * 0.15;
    if (score < bestScore - 0.01 || (score === bestScore && score < originalScore && cost < bestCost)) {
      bestRoute = route;
      bestScore = score;
      bestCost = cost;
    }
  };

  // A single level below or beside the obstruction produces readable BIM runs.
  for (const depth of [2.75, 3, 3.25, 3.5, 3.75, 4, 2.25, 2, 1.75, 1.5, 1.25, 1]) {
    if (Math.abs(depth - a.depth) < 0.05 && Math.abs(depth - b.depth) < 0.05) continue;
    consider([
      localWaypoints[0],
      { ...localWaypoints[0], depth },
      { ...localWaypoints[1], depth },
      localWaypoints[1],
    ]);
  }
  const planarLength = Math.hypot(dx, dz);
  if (planarLength > 0.1) {
    for (const offset of [-6, -4, -2, 2, 4, 6]) {
      const ox = (-dz / planarLength) * offset;
      const oz = (dx / planarLength) * offset;
      consider([
        localWaypoints[0],
        { ...localWaypoints[0], x: localWaypoints[0].x + ox, z: localWaypoints[0].z + oz },
        { ...localWaypoints[1], x: localWaypoints[1].x + ox, z: localWaypoints[1].z + oz },
        localWaypoints[1],
      ]);
    }
  }
  if (bestScore > 0) {
    const detour = findDetourPath({ ...run, waypoints: localWaypoints }, relevantLines, clash);
    if (detour !== localWaypoints) consider(detour);
  }
  if (!bestRoute) {
    return {
      waypoints: origWaypoints,
      metrics: {
        clearanceBefore: measureMinimumClearance([run], existingList) ?? 0,
        clearanceAfter: measureMinimumClearance([run], existingList) ?? 0,
        lengthDelta: 0,
        depthDelta: 0,
        costEst: 0,
      },
    };
  }
  const sparseWaypoints = bestRoute;
  const origLen = polyLength(origWaypoints);
  const newLen = polyLength(sparseWaypoints);
  const lengthDelta = Number((newLen - origLen).toFixed(1));
  const origDepthAvg = origWaypoints.reduce((a, b) => a + b.depth, 0) / origWaypoints.length;
  const newDepthAvg = sparseWaypoints.reduce((a, b) => a + b.depth, 0) / sparseWaypoints.length;
  const depthDelta = Number((newDepthAvg - origDepthAvg).toFixed(1));

  return {
    waypoints: sparseWaypoints,
    metrics: {
      clearanceBefore: measureMinimumClearance([run], existingList) ?? 0,
      clearanceAfter: measureMinimumClearance([{ ...run, waypoints: sparseWaypoints }], existingList) ?? 0,
      lengthDelta,
      depthDelta,
      costEst: estimateCost(lengthDelta, depthDelta)
    }
  };
}
