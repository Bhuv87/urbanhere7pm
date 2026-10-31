import { Utility } from '../dataHelpers';
import { PlacedPipeRun } from './clashDetection';
import { generatePipeGeometryData } from './pipeGenerator';

type PipeType = PlacedPipeRun['type'];

const PIPE_STYLE: Record<PipeType, { color: string; diameter: number; depth: number }> = {
  water: { color: '#0284c7', diameter: 0.8, depth: 2.5 },
  gas: { color: '#f59e0b', diameter: 0.45, depth: 1.8 },
  fiber: { color: '#d946ef', diameter: 0.25, depth: 0.9 },
  power: { color: '#dc2626', diameter: 0.35, depth: 1.4 },
};

/** Connect a plot to the closest point on an existing or manually drawn main. */
export function generatePipeToNearestMain(
  housePos: [number, number],
  targetType: PipeType,
  utilities: Utility[],
  placedRuns: PlacedPipeRun[] = [],
  sourceHouseId?: string,
): PlacedPipeRun | null {
  const mains = [
    ...utilities.filter((utility) => utility.type === targetType).map((utility) => ({
      id: utility.id,
      path: utility.path.map(([x, y, z]) => ({ x, z, depth: Math.max(0, -y) })),
    })),
    ...placedRuns.filter((run) => run.type === targetType && !run.id.startsWith('pipe-auto-'))
      .map((run) => ({ id: run.id, path: run.waypoints })),
  ];
  let closest: { x: number; z: number; depth: number } | null = null;
  let connectedMainId: string | undefined;
  let bestDistance = Infinity;
  for (const main of mains) {
    const path = main.path;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const t = Math.max(0, Math.min(1,
        ((housePos[0] - a.x) * dx + (housePos[1] - a.z) * dz) / (dx * dx + dz * dz || 1)));
      const point = { x: a.x + t * dx, z: a.z + t * dz, depth: a.depth + t * (b.depth - a.depth) };
      const distance = Math.hypot(point.x - housePos[0], point.z - housePos[1]);
      if (distance < bestDistance) {
        bestDistance = distance;
        closest = point;
        connectedMainId = main.id;
      }
    }
  }
  if (!closest || bestDistance < 0.1) return null;
  const style = PIPE_STYLE[targetType];
  const waypoints = [
    { x: housePos[0], z: housePos[1], depth: style.depth },
    closest,
  ];
  if (generatePipeGeometryData(waypoints).segments.length === 0) return null;
  return {
    id: `pipe-auto-${crypto.randomUUID()}`,
    type: targetType,
    color: style.color,
    diameter: style.diameter,
    defaultDepth: style.depth,
    waypoints,
    status: 'committed',
    sourceHouseId,
    connectedMainId,
  };
}
