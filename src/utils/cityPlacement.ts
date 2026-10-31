import { StreetData, getLocalBuildings } from '../dataHelpers';
import { HouseModelVariant } from '../data/houseModels';
import { PlacedHouseData } from './exportGeoJSON';

export interface PlannedCityPlot {
  streetId: string;
  plot: [number, number];
  side: -1 | 1;
  row: 0 | 1;
}

interface OccupiedPlot {
  plot: [number, number];
  footprint: [number, number];
}

/** Fill surveyed frontage first, then plots along a narrow service lane. */
export function planCityHouses(
  streets: StreetData[],
  selectedStreetId: string,
  origin: [number, number],
  count: number,
  models: HouseModelVariant[],
  targetType: string,
  existingHouses: Record<string, PlacedHouseData[]>,
): PlannedCityPlot[] {
  const targetModels = models.filter((model) => model.category === targetType);
  if (!targetModels.length || count <= 0) return [];
  const footprint: [number, number] = [
    Math.max(...targetModels.map((model) => model.footprint[0])),
    Math.max(...targetModels.map((model) => model.footprint[1])),
  ];
  const [width, depth] = footprint;
  const selected = streets.find((street) => street.id === selectedStreetId);
  if (!selected) return [];
  const streetOrder = [selected, ...streets.filter((street) => street.id !== selectedStreetId)];
  const firstSide: -1 | 1 = origin[1] >= 0 ? 1 : -1;
  const sideOrder: Array<-1 | 1> = [firstSide, firstSide === 1 ? -1 : 1];
  const result: PlannedCityPlot[] = [];

  for (const street of streetOrder) {
    const occupied: OccupiedPlot[] = [
      ...getLocalBuildings(street).map((building) => ({
        plot: building.plot,
        footprint: building.footprint,
      })),
      ...(existingHouses[street.id] || []).map((house) => ({
        plot: house.plot,
        footprint: (models.find((model) => model.id === house.modelId)?.footprint ||
          models.find((model) => model.category === house.type)?.footprint ||
          footprint) as [number, number],
      })),
    ];
    const minX = -street.length / 2 + width / 2 + 2;
    const maxX = street.length / 2 - width / 2 - 2;
    const spacingX = width + 1.8;
    const slots: number[] = [];
    for (let x = minX; x <= maxX + 0.01; x += spacingX) slots.push(Number(x.toFixed(2)));
    slots.sort((a, b) => Math.abs(a - origin[0]) - Math.abs(b - origin[0]) || a - b);
    const frontZ = street.roadWidth / 2 + street.sidewalkWidth + 1.5 + depth / 2;
    const rearZ = frontZ + depth + 5;

    for (const row of [0, 1] as const) {
      for (const x of slots) {
        for (const side of sideOrder) {
          const z = side * (row === 0 ? frontZ : rearZ);
          if (Math.abs(z) + depth / 2 > 42) continue;
          const plot: [number, number] = [x, Number(z.toFixed(2))];
          const blocked = occupied.some((item) =>
            Math.abs(item.plot[0] - x) < (item.footprint[0] + width) / 2 + 1 &&
            Math.abs(item.plot[1] - z) < (item.footprint[1] + depth) / 2 + 1);
          if (blocked) continue;
          result.push({ streetId: street.id, plot, side, row });
          occupied.push({ plot, footprint });
          if (result.length >= count) return result;
        }
      }
    }
  }
  return result;
}
