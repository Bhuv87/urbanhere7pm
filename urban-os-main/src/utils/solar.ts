import * as SunCalc from 'suncalc';

// Bengaluru geographic coordinates
export const BENGALURU_LAT = 12.9716;
export const BENGALURU_LNG = 77.5946;

export interface SunPosition {
  x: number;
  y: number;
  z: number;
  altitude: number;
  azimuth: number;
  intensity: number;
}

export function calculateSunPosition(
  decimalHour: number,
  distance = 100
): SunPosition {
  const now = new Date();
  const hours = Math.floor(decimalHour);
  const minutes = Math.floor((decimalHour - hours) * 60);
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  const sun = SunCalc.getPosition(date, BENGALURU_LAT, BENGALURU_LNG);
  const alt = sun.altitude;
  const az = sun.azimuth;

  // If alt <= 0 (night), clamp light slightly above horizon or reduce intensity
  const effectiveAlt = Math.max(0.05, alt);
  const x = distance * Math.cos(effectiveAlt) * Math.sin(az);
  const y = Math.max(10, distance * Math.sin(effectiveAlt));
  const z = distance * Math.cos(effectiveAlt) * Math.cos(az);

  const intensity = Math.max(0.2, Math.sin(effectiveAlt) * 1.8);

  return {
    x,
    y,
    z,
    altitude: alt,
    azimuth: az,
    intensity,
  };
}

export function formatTimeLabel(decimalHour: number): string {
  const hours24 = Math.floor(decimalHour);
  const mins = Math.floor((decimalHour - hours24) * 60);
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const minStr = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hours12}:${minStr} ${ampm}`;
}
