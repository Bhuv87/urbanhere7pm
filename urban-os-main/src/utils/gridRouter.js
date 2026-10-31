import * as THREE from 'three';

const VOXEL = 0.5;
const keyOf = (p) => `${p.x},${p.y},${p.z}`;

class MinHeap {
  items = [];
  push(item) {
    const items = this.items;
    items.push(item);
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (items[parent].f <= item.f) break;
      items[i] = items[parent];
      i = parent;
    }
    items[i] = item;
  }
  pop() {
    const items = this.items;
    const first = items[0];
    const last = items.pop();
    if (items.length) {
      let i = 0;
      while (i * 2 + 1 < items.length) {
        let child = i * 2 + 1;
        if (child + 1 < items.length && items[child + 1].f < items[child].f) child++;
        if (last.f <= items[child].f) break;
        items[i] = items[child];
        i = child;
      }
      items[i] = last;
    }
    return first;
  }
  get length() { return this.items.length; }
}

export function findDetourPath(run, relevantLines, clash) {
  const original = run.waypoints || [];
  if (original.length < 2) return original;
  const first = original[0];
  const last = original[original.length - 1];
  const snap = (n) => Math.round(n / VOXEL);
  const start = { x: snap(first.x), y: snap(-first.depth), z: snap(first.z) };
  const goal = { x: snap(last.x), y: snap(-last.depth), z: snap(last.z) };
  const cx = clash.position?.[0] ?? (first.x + last.x) / 2;
  const cz = clash.position?.[2] ?? (first.z + last.z) / 2;
  const bounds = {
    minX: snap(Math.min(first.x, last.x, cx) - 5),
    maxX: snap(Math.max(first.x, last.x, cx) + 5),
    minZ: snap(Math.min(first.z, last.z, cz) - 5),
    maxZ: snap(Math.max(first.z, last.z, cz) + 5),
    minY: Math.min(snap(-4.5), start.y, goal.y),
    maxY: Math.max(snap(0.5), start.y, goal.y),
  };
  const segments = Array.isArray(relevantLines) ? relevantLines : [];
  const point = new THREE.Vector3();
  const nearest = new THREE.Vector3();
  const baseline = new THREE.Line3(
    new THREE.Vector3(first.x, -first.depth, first.z),
    new THREE.Vector3(last.x, -last.depth, last.z),
  );
  const isBlocked = (p) => {
    point.set(p.x * VOXEL, p.y * VOXEL, p.z * VOXEL);
    return segments.some(({ line, radius }) => {
      line.closestPointToPoint(point, true, nearest);
      return nearest.distanceToSquared(point) < radius * radius;
    });
  };
  const goalKey = keyOf(goal);
  const startKey = keyOf(start);
  const heuristic = (p) => Math.abs(goal.x - p.x) + Math.abs(goal.y - p.y) + Math.abs(goal.z - p.z);
  const open = new MinHeap();
  open.push({ p: start, g: 0, f: heuristic(start) });
  const best = new Map([[startKey, 0]]);
  const parent = new Map();
  const nodes = new Map([[startKey, start]]);
  const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  let found = false;

  while (open.length) {
    const current = open.pop();
    const currentKey = keyOf(current.p);
    if (current.g !== best.get(currentKey)) continue;
    if (currentKey === goalKey) { found = true; break; }
    for (const [dx, dy, dz] of dirs) {
      const next = { x: current.p.x + dx, y: current.p.y + dy, z: current.p.z + dz };
      if (next.x < bounds.minX || next.x > bounds.maxX ||
          next.y < bounds.minY || next.y > bounds.maxY ||
          next.z < bounds.minZ || next.z > bounds.maxZ) continue;
      const nextKey = keyOf(next);
      if (nextKey !== goalKey && nextKey !== startKey && isBlocked(next)) continue;
      const worldY = next.y * VOXEL;
      let cost = 1 + (dy ? 0.8 : 0);
      if (worldY > 0 || worldY < -4) cost += 500;
      point.set(next.x * VOXEL, worldY, next.z * VOXEL);
      baseline.closestPointToPoint(point, true, nearest);
      cost += nearest.distanceTo(point) * 0.02;
      const g = current.g + cost;
      if (g >= (best.get(nextKey) ?? Infinity)) continue;
      best.set(nextKey, g);
      parent.set(nextKey, currentKey);
      nodes.set(nextKey, next);
      open.push({ p: next, g, f: g + heuristic(next) });
    }
  }

  if (!found) return original;
  const path = [];
  for (let key = goalKey; key; key = parent.get(key)) {
    path.push(nodes.get(key));
    if (key === startKey) break;
  }
  path.reverse();
  if (path.length < 2) return original;
  const reduced = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const a = path[i - 1], b = path[i], c = path[i + 1];
    if (b.x - a.x !== c.x - b.x || b.y - a.y !== c.y - b.y || b.z - a.z !== c.z - b.z) {
      reduced.push(b);
    }
  }
  reduced.push(path[path.length - 1]);
  const routed = reduced.map((p) => ({
    x: p.x * VOXEL,
    z: p.z * VOXEL,
    depth: Math.max(0, -p.y * VOXEL),
  }));
  routed[0] = { x: first.x, z: first.z, depth: first.depth };
  routed[routed.length - 1] = { x: last.x, z: last.z, depth: last.depth };
  return routed;
}
