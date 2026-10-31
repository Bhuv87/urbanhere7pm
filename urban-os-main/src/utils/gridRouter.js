import * as THREE from 'three';

if (!THREE.Line3.prototype.distanceSqToPoint) {
  THREE.Line3.prototype.distanceSqToPoint = function(point) {
    const target = new THREE.Vector3();
    this.closestPointToPoint(point, true, target);
    return target.distanceToSquared(point);
  };
}

export function findDetourPath(run, relevantLines, clash) {
  const origWaypoints = run.waypoints || [];
  const cx = clash.position ? clash.position[0] : origWaypoints[0].x;
  const cz = clash.position ? clash.position[2] : origWaypoints[0].z;

  const V = 0.25;
  const xMin = cx - 6.0, xMax = cx + 6.0;
  const zMin = cz - 6.0, zMax = cz + 6.0;
  const yMin = -4.0, yMax = -0.8;

  const isBlocked = (x, y, z) => {
    const pt = new THREE.Vector3(x, y, z);
    for (const rL of relevantLines) {
      if (rL.line.distanceSqToPoint(pt) < rL.radius * rL.radius) return true;
    }
    return false;
  };

  const w0 = origWaypoints[0];
  const wLast = origWaypoints[origWaypoints.length - 1];
  const entryRaw = {
    x: Math.max(xMin, Math.min(xMax, w0.x)),
    y: Math.max(yMin, Math.min(yMax, -w0.depth)),
    z: Math.max(zMin, Math.min(zMax, w0.z)),
  };
  const exitRaw = {
    x: Math.max(xMin, Math.min(xMax, wLast.x)),
    y: Math.max(yMin, Math.min(yMax, -wLast.depth)),
    z: Math.max(zMin, Math.min(zMax, wLast.z)),
  };

  const snap = (v, min) => Math.round((v - min) / V) * V + min;
  const startPt = { x: snap(entryRaw.x, xMin), y: snap(entryRaw.y, yMin), z: snap(entryRaw.z, zMin) };
  const endPt = { x: snap(exitRaw.x, xMin), y: snap(exitRaw.y, yMin), z: snap(exitRaw.z, zMin) };

  const baseline = new THREE.Line3(
    new THREE.Vector3(startPt.x, startPt.y, startPt.z),
    new THREE.Vector3(endPt.x, endPt.y, endPt.z)
  );
  const keyOf = (x, y, z) => `${Math.round(x * 100)},${Math.round(y * 100)},${Math.round(z * 100)}`;
  const startKey = keyOf(startPt.x, startPt.y, startPt.z);
  const endKey = keyOf(endPt.x, endPt.y, endPt.z);

  const openSet = [{
    pt: startPt,
    g: 0,
    f: Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y, endPt.z - startPt.z) / V,
    dir: null,
  }];
  const cameFrom = new Map();
  const gScores = new Map([[startKey, 0]]);
  const closedSet = new Set();
  const dirs = [
    [1,0,0], [-1,0,0], [0,0,1], [0,0,-1], [0,1,0], [0,-1,0],
    [1,0,1], [1,0,-1], [-1,0,1], [-1,0,-1],
  ];

  let current = null;
  let iters = 0;

  while (openSet.length > 0 && iters < 3500) {
    iters++;
    let bestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[bestIdx].f) bestIdx = i;
    }
    current = openSet.splice(bestIdx, 1)[0];
    const cKey = keyOf(current.pt.x, current.pt.y, current.pt.z);

    if (Math.hypot(current.pt.x - endPt.x, current.pt.y - endPt.y, current.pt.z - endPt.z) < V * 1.1) {
      break;
    }
    closedSet.add(cKey);

    for (const [dx, dy, dz] of dirs) {
      const nx = snap(current.pt.x + dx * V, xMin);
      const ny = snap(current.pt.y + dy * V, yMin);
      const nz = snap(current.pt.z + dz * V, zMin);
      if (nx < xMin || nx > xMax || ny < yMin || ny > yMax || nz < zMin || nz > zMax) continue;

      const nKey = keyOf(nx, ny, nz);
      if (closedSet.has(nKey)) continue;
      if (nKey !== endKey && nKey !== startKey && isBlocked(nx, ny, nz)) continue;

      let moveCost = Math.hypot(dx, dy, dz);
      if (Math.abs(dy) > 0) moveCost += 2.0 * Math.abs(dy);
      const latDist = Math.sqrt(baseline.distanceSqToPoint(new THREE.Vector3(nx, ny, nz)));
      moveCost += 3.0 * (latDist / 1.5);

      if (current.dir) {
        const dot = (current.dir[0] * dx + current.dir[1] * dy + current.dir[2] * dz) /
                    (Math.hypot(...current.dir) * Math.hypot(dx, dy, dz));
        if (dot < 0.707) moveCost += 5.0;
      }

      const tentativeG = current.g + moveCost;
      if (!gScores.has(nKey) || tentativeG < gScores.get(nKey)) {
        gScores.set(nKey, tentativeG);
        cameFrom.set(nKey, { pt: current.pt, key: cKey });
        const h = Math.hypot(endPt.x - nx, endPt.y - ny, endPt.z - nz) / V;
        openSet.push({ pt: { x: nx, y: ny, z: nz }, g: tentativeG, f: tentativeG + h, dir: [dx, dy, dz] });
      }
    }
  }

  const rawPath = [endPt];
  let currTrace = keyOf(current.pt.x, current.pt.y, current.pt.z);
  while (cameFrom.has(currTrace)) {
    const prevNode = cameFrom.get(currTrace);
    rawPath.push(prevNode.pt);
    currTrace = prevNode.key;
  }
  rawPath.reverse();

  // Collinear reduction
  const reduced = [rawPath[0]];
  for (let i = 1; i < rawPath.length - 1; i++) {
    const pPrev = reduced[reduced.length - 1], pCurr = rawPath[i], pNext = rawPath[i + 1];
    const v1 = [pCurr.x - pPrev.x, pCurr.y - pPrev.y, pCurr.z - pPrev.z];
    const v2 = [pNext.x - pCurr.x, pNext.y - pCurr.y, pNext.z - pCurr.z];
    const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
    if (l1 < 1e-4 || l2 < 1e-4) continue;
    const dot = (v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2]) / (l1 * l2);
    if (dot < 0.9998) reduced.push(pCurr);
  }
  reduced.push(rawPath[rawPath.length - 1]);

  const sparse = reduced.map((p) => ({
    x: Number(p.x.toFixed(2)),
    z: Number(p.z.toFixed(2)),
    depth: Number(Math.max(0.8, -p.y).toFixed(2)),
  }));

  if (Math.hypot(w0.x - sparse[0].x, w0.z - sparse[0].z) > 0.25) {
    sparse.unshift({ x: w0.x, z: w0.z, depth: w0.depth });
  }
  const lastSparse = sparse[sparse.length - 1];
  if (Math.hypot(wLast.x - lastSparse.x, wLast.z - lastSparse.z) > 0.25) {
    sparse.push({ x: wLast.x, z: wLast.z, depth: wLast.depth });
  }

  return sparse;
}
