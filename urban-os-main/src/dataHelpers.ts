import bengaluruData from './data/bengaluru.json';

export interface Utility {
  id: string;
  agency: string;
  type: 'water' | 'gas' | 'fiber' | 'power';
  color: string;
  diameter: number;
  depth_m: number;
  path: [number, number, number][];
}

export interface Building {
  id: string;
  name?: string;
  plot: [number, number];
  footprint: [number, number];
  floors: number;
  type: string;
  hasSolar?: boolean;
}

export interface StreetData {
  id: string;
  name: string;
  problem?: boolean;
  origin: [number, number, number];
  orientation: string;
  length: number;
  roadWidth: number;
  sidewalkWidth: number;
  emptyPlotCenter?: [number, number, number];
  buildings: Building[];
  utilities: Utility[];
}

export interface AreaData {
  id: string;
  name: string;
  streets: StreetData[];
}

export interface CityData {
  id: string;
  name: string;
  areas: AreaData[];
}

export const CITIES: CityData[] = bengaluruData.cities as unknown as CityData[];

// Derive problem street, area, city
let derivedCity = 'bengaluru';
let derivedArea = 'uttarahalli';
let derivedStreet = 'utt-main';

for (const city of CITIES) {
  for (const area of city.areas) {
    const probSt = area.streets.find((s) => s.problem);
    if (probSt) {
      derivedCity = city.id;
      derivedArea = area.id;
      derivedStreet = probSt.id;
      break;
    }
  }
}

export const PROBLEM_CITY_ID = derivedCity;
export const PROBLEM_AREA_ID = derivedArea;
export const PROBLEM_STREET_ID = derivedStreet;

export function getCity(cityId: string) {
  return CITIES.find((c) => c.id === cityId) || CITIES[0];
}

export function getArea(cityId: string, areaId: string) {
  const city = getCity(cityId);
  return city.areas.find((a) => a.id === areaId) || city.areas[0];
}

export function getStreet(cityId: string, areaId: string, streetId: string) {
  const area = getArea(cityId, areaId);
  return area.streets.find((s) => s.id === streetId) || area.streets[0];
}
