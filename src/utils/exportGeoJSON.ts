import { PlacedPipeRun } from './clashDetection';

export interface PlacedHouseData {
  id: string;
  type: '20x30' | '30x40' | '40x60' | string;
  modelId?: string;
  plot: [number, number];
  rotation: number;
  rotation3D?: [number, number, number]; // [Pitch (X), Yaw (Y), Roll (Z)] in degrees
  heightScale?: number;
  customHeight?: number;
}

const BENGALURU_LAT = 12.9716;
const BENGALURU_LNG = 77.5946;
const METERS_PER_DEGREE_LAT = 111320;
const METERS_PER_DEGREE_LNG = 108480;

function metersToCoordinates(x: number, z: number): [number, number] {
  const lng = BENGALURU_LNG + x / METERS_PER_DEGREE_LNG;
  const lat = BENGALURU_LAT - z / METERS_PER_DEGREE_LAT;
  return [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))];
}

export function generateTwinGeoJSON(
  streetName: string,
  houses: PlacedHouseData[],
  pipeRuns: PlacedPipeRun[]
) {
  const features: any[] = [];

  // Export placed houses as Polygons
  for (const house of houses || []) {
    let width = 6.1; // 20ft
    let depth = 9.1; // 30ft
    let sqft = 600;
    if (house.type === '30x40') {
      width = 9.1;
      depth = 12.2;
      sqft = 1200;
    } else if (house.type === '40x60') {
      width = 12.2;
      depth = 18.3;
      sqft = 2400;
    }

    const cx = house.plot[0];
    const cz = house.plot[1];
    const hw = width / 2;
    const hd = depth / 2;

    const corners = [
      [cx - hw, cz - hd],
      [cx + hw, cz - hd],
      [cx + hw, cz + hd],
      [cx - hw, cz + hd],
      [cx - hw, cz - hd], // closed ring
    ];

    const coordinates = [corners.map(([x, z]) => metersToCoordinates(x, z))];

    features.push({
      type: 'Feature',
      id: house.id,
      properties: {
        featureClass: 'Building',
        type: house.type,
        sizeSqFt: sqft,
        street: streetName,
        jurisdiction: 'BBMP South Zone',
      },
      geometry: {
        type: 'Polygon',
        coordinates,
      },
    });
  }

  // Export placed pipes as LineStrings
  for (const run of pipeRuns || []) {
    if (run.waypoints.length < 2) continue;

    const coordinates = run.waypoints.map((wp) => metersToCoordinates(wp.x, wp.z));

    features.push({
      type: 'Feature',
      id: run.id,
      properties: {
        featureClass: 'UndergroundUtility',
        type: run.type,
        diameter_m: run.diameter,
        depth_m: run.defaultDepth,
        status: run.status || 'committed',
        agency: run.type === 'water' ? 'BWSSB' : run.type === 'gas' ? 'GAIL' : run.type === 'fiber' ? 'DOT' : 'BESCOM',
        street: streetName,
      },
      geometry: {
        type: 'LineString',
        coordinates,
      },
    });
  }

  return {
    type: 'FeatureCollection',
    metadata: {
      title: `Bengaluru Digital Twin — ${streetName}`,
      generator: 'Bengaluru Digital Twin v1',
      exportedAt: new Date().toISOString(),
      coordinateSystem: 'EPSG:4326 (WGS84)',
    },
    features,
  };
}

export function downloadGeoJSON(
  streetName: string,
  houses: PlacedHouseData[],
  pipeRuns: PlacedPipeRun[]
) {
  const geojson = generateTwinGeoJSON(streetName, houses, pipeRuns);
  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: 'application/geo+json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  a.href = url;
  a.download = `bengaluru-twin-${timestamp}.geojson`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
