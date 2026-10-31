/**
 * Grid snapping utility for CAD precision
 */
export function gridSnap(value: number, step = 1): number {
  return Math.round(value / step) * step;
}

export function gridSnap2D(x: number, z: number, step = 1): [number, number] {
  return [gridSnap(x, step), gridSnap(z, step)];
}
