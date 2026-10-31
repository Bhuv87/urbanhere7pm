export interface ZoningReport {
  height: number;
  maxHeight: number;
  heightPass: boolean;
  setback: number;
  minSetback: number;
  setbackPass: boolean;
  allPass: boolean;
  details: string[];
}

export interface BoundingBox3D {
  min: [number, number, number];
  max: [number, number, number];
}

export function evaluateZoningCompliance(
  bbox: BoundingBox3D,
  plotCenter: [number, number, number] = [20, 0, -18],
  plotWidth = 24, // meters along X
  plotDepth = 20, // meters along Z
  customMaxHeight: number = 30.0 // Configurable municipal maximum height
): ZoningReport {
  const height = Math.max(0, bbox.max[1] - bbox.min[1]);
  const maxHeight = customMaxHeight;
  const heightPass = height <= maxHeight;

  // Plot boundaries
  const plotMinX = plotCenter[0] - plotWidth / 2;
  const plotMaxX = plotCenter[0] + plotWidth / 2;
  const plotMinZ = plotCenter[2] - plotDepth / 2;
  const plotMaxZ = plotCenter[2] + plotDepth / 2;

  // Setbacks on 4 sides
  const setbackWest = Math.max(0, bbox.min[0] - plotMinX);
  const setbackEast = Math.max(0, plotMaxX - bbox.max[0]);
  const setbackNorth = Math.max(0, bbox.min[2] - plotMinZ);
  const setbackSouth = Math.max(0, plotMaxZ - bbox.max[2]);

  const minObservedSetback = Math.min(setbackWest, setbackEast, setbackNorth, setbackSouth);
  const requiredMinSetback = 3.0; // 3m municipal setback
  const setbackPass = minObservedSetback >= requiredMinSetback;

  const allPass = heightPass && setbackPass;

  const details: string[] = [];
  if (!heightPass) {
    details.push(`Height exceeds municipal limit of ${maxHeight}m (measured ${height.toFixed(1)}m)`);
  }
  if (!setbackPass) {
    details.push(`Setback violates mandatory 3.0m perimeter buffer (measured ${minObservedSetback.toFixed(1)}m)`);
  }

  return {
    height: parseFloat(height.toFixed(1)),
    maxHeight,
    heightPass,
    setback: parseFloat(minObservedSetback.toFixed(1)),
    minSetback: requiredMinSetback,
    setbackPass,
    allPass,
    details,
  };
}
