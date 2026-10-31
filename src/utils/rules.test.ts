import test from 'node:test';
import assert from 'node:assert/strict';
import { gridSnap, gridSnap2D } from './gridSnap';
import { generatePipeGeometryData } from './pipeGenerator';
import { findClashes, PlacedPipeRun } from './clashDetection';
import { evaluateZoningCompliance } from './zoning';
import { calculateSunPosition } from './solar';
import { Utility, getArea, getLocalBuildings, getLocalUtilities } from '../dataHelpers';
import { DEFAULT_HOUSE_MODELS } from '../data/houseModels';
import * as THREE from 'three';
import { findDetourPath } from './gridRouter';
import { generatePipeToNearestMain } from './autoConnectPipe';
import { rerouteRun, scanAllClashes } from './scanEngine';
import { planCityHouses } from './cityPlacement';

test('gridSnap snaps to nearest whole meter', () => {
  assert.equal(gridSnap(1.4), 1);
  assert.equal(gridSnap(1.6), 2);
  assert.deepEqual(gridSnap2D(3.2, 7.8), [3, 8]);
});

test('generatePipeGeometryData creates horizontal segments, elbows, and flanges', () => {
  const waypoints = [
    { x: 0, z: 0, depth: 2.0 },
    { x: 10, z: 0, depth: 2.0 },
    { x: 10, z: 15, depth: 2.0 },
  ];
  const result = generatePipeGeometryData(waypoints);
  assert.equal(result.segments.length, 2);
  assert.equal(result.segments[0].length, 10);
  assert.equal(result.segments[1].length, 15);
  assert.equal(result.elbows.length, 1); // 1 corner elbow
  assert.equal(result.flanges.length, 2); // start and end flanges
});

test('generatePipeGeometryData handles depth change with vertical segment and elbow', () => {
  const waypoints = [
    { x: 0, z: 0, depth: 1.5 },
    { x: 10, z: 0, depth: 3.5 },
  ];
  const result = generatePipeGeometryData(waypoints);
  assert.equal(result.segments.length, 2); // 1 vertical, 1 horizontal
  assert.equal(result.segments[0].type, 'vertical');
  assert.equal(result.segments[1].type, 'horizontal');
  assert.equal(result.elbows.length, 1);
});

test('findClashes detects intersection within safety margin', () => {
  const existingUtilities: Utility[] = [
    {
      id: 'ex-fiber',
      agency: 'BSNL',
      type: 'fiber',
      color: '#ff00aa',
      diameter: 0.2,
      depth_m: 1.2,
      path: [
        [-10, -1.2, 5],
        [10, -1.2, 5],
      ],
    },
  ];

  // A crossing gas pipe at depth 1.3 that crosses at (0, -1.3, 5) -> distance 0.1m < safety ~0.6m
  const newRuns: PlacedPipeRun[] = [
    {
      id: 'new-gas',
      type: 'gas',
      color: '#ff8800',
      diameter: 0.4,
      defaultDepth: 1.3,
      waypoints: [
        { x: 0, z: 0, depth: 1.3 },
        { x: 0, z: 10, depth: 1.3 },
      ],
    },
  ];

  const clashes = findClashes(existingUtilities, newRuns);
  assert.equal(clashes.length, 1);
  assert.equal(clashes[0].existingId, 'ex-fiber');
  assert.ok(clashes[0].distance < 0.2);
});

test('evaluateZoningCompliance validates height and setback limits', () => {
  // CAD model within limits
  const compliantBox = {
    min: [17, 0, -21] as [number, number, number],
    max: [23, 24, -15] as [number, number, number],
  };
  const report1 = evaluateZoningCompliance(compliantBox, [20, 0, -18], 24, 20);
  assert.equal(report1.heightPass, true);
  assert.equal(report1.setbackPass, true);
  assert.equal(report1.allPass, true);

  // CAD model exceeding 30m height limit
  const tallBox = {
    min: [17, 0, -21] as [number, number, number],
    max: [23, 45, -15] as [number, number, number],
  };
  const report2 = evaluateZoningCompliance(tallBox, [20, 0, -18], 24, 20);
  assert.equal(report2.heightPass, false);
  assert.equal(report2.allPass, false);

  // When manually raising height limit to 50m, tallBox passes
  const reportCustomLimitPass = evaluateZoningCompliance(tallBox, [20, 0, -18], 24, 20, 50.0);
  assert.equal(reportCustomLimitPass.heightPass, true);
  assert.equal(reportCustomLimitPass.maxHeight, 50.0);

  // When manually lowering height limit to 15m (low-rise zone), compliantBox (24m) fails
  const reportCustomLimitFail = evaluateZoningCompliance(compliantBox, [20, 0, -18], 24, 20, 15.0);
  assert.equal(reportCustomLimitFail.heightPass, false);
  assert.equal(reportCustomLimitFail.maxHeight, 15.0);
});

test('calculateSunPosition produces realistic Bengaluru coordinates at 3:00 PM', () => {
  const sun = calculateSunPosition(15.0);
  assert.ok(sun.y > 0); // Above horizon
  assert.ok(sun.intensity > 0);
});

test('auto-connect uses the closest point on a matching main', () => {
  const utilities: Utility[] = [
    { id: 'water-main', agency: 'BWSSB', type: 'water', color: '#0284c7', diameter: 0.8, depth_m: 2.5, path: [[0, -2.5, -10], [0, -2.5, 10]] },
    { id: 'gas-main', agency: 'GAIL', type: 'gas', color: '#f59e0b', diameter: 0.45, depth_m: 1.8, path: [[20, -1.8, -10], [20, -1.8, 10]] },
  ];
  const run = generatePipeToNearestMain([5, 3], 'water', utilities, [], 'house-test');
  assert.ok(run);
  assert.equal(run.sourceHouseId, 'house-test');
  assert.equal(run.connectedMainId, 'water-main');
  assert.deepEqual(run.waypoints[1], { x: 0, z: 3, depth: 2.5 });
  assert.ok(generatePipeGeometryData(run.waypoints).segments.length > 0);
  assert.equal(findClashes(utilities, [run]).length, 0);
  assert.equal(scanAllClashes([run], utilities, 'test-street').length, 0);
  const crossing: Utility = {
    id: 'fiber-crossing', agency: 'TELECOM', type: 'fiber', color: '#d946ef',
    diameter: 0.25, depth_m: 2.5, path: [[2.5, -2.5, 1], [2.5, -2.5, 5]],
  };
  assert.ok(scanAllClashes([run], [...utilities, crossing], 'test-street').length > 0);
});

test('router finds a complete detour around a blocked main', () => {
  const original = [{ x: -5, z: 0, depth: 2 }, { x: 5, z: 0, depth: 2 }];
  const obstacle = new THREE.Line3(new THREE.Vector3(0, -2, -2), new THREE.Vector3(0, -2, 2));
  const routed = findDetourPath({ waypoints: original }, [{ line: obstacle, radius: 0.9 }], { position: [0, -2, 0] });
  assert.notEqual(routed, original);
  assert.deepEqual(routed[0], original[0]);
  assert.deepEqual(routed[routed.length - 1], original[1]);
  assert.ok(routed.every((wp: { depth: number }) => wp.depth <= 4));
  const closest = new THREE.Vector3();
  for (const segment of generatePipeGeometryData(routed).segments) {
    const a = new THREE.Vector3(...segment.start);
    const b = new THREE.Vector3(...segment.end);
    for (let t = 0; t <= 1; t += 0.1) {
      const point = a.clone().lerp(b, t);
      obstacle.closestPointToPoint(point, true, closest);
      assert.ok(point.distanceTo(closest) >= 0.89);
    }
  }
});

test('auto-fix preserves distant waypoints and clears a local clash', () => {
  const run: PlacedPipeRun = {
    id: 'test-run', type: 'water', color: '#0284c7', diameter: 0.4, defaultDepth: 2,
    waypoints: [
      { x: -30, z: 0, depth: 2 },
      { x: -10, z: 0, depth: 2 },
      { x: 30, z: 0, depth: 2 },
    ],
  };
  const existing: Utility[] = [{
    id: 'crossing', agency: 'GAIL', type: 'gas', color: '#f59e0b', diameter: 0.4,
    depth_m: 2, path: [[0, -2, -2], [0, -2, 2]],
  }];
  const originalClashes = scanAllClashes([run], existing, 'test-street');
  assert.ok(originalClashes.length > 0);
  const { waypoints } = rerouteRun(run, existing, originalClashes[0]);
  assert.deepEqual(waypoints[0], run.waypoints[0]);
  assert.deepEqual(waypoints[waypoints.length - 1], run.waypoints[2]);
  assert.ok(waypoints.some((wp: { x: number }) => wp.x === -10));
  assert.equal(scanAllClashes([{ ...run, waypoints }], existing, 'test-street').length, 0);
});

test('agent plans 50 non-overlapping city plots across surveyed streets', () => {
  const streets = getArea('bengaluru', 'uttarahalli').streets;
  const plots = planCityHouses(streets, 'utt-main', [20, -18], 50, DEFAULT_HOUSE_MODELS, '30x40', {});
  assert.equal(plots.length, 50);
  assert.ok(new Set(plots.map((plot) => plot.streetId)).size > 1);
  const models = DEFAULT_HOUSE_MODELS.filter((model) => model.category === '30x40');
  const width = Math.max(...models.map((model) => model.footprint[0]));
  const depth = Math.max(...models.map((model) => model.footprint[1]));
  for (const street of streets) {
    const streetPlots = plots.filter((plot) => plot.streetId === street.id);
    for (const placed of streetPlots) {
      assert.ok(Math.abs(placed.plot[0]) + width / 2 < street.length / 2);
      assert.ok(Math.abs(placed.plot[1]) - depth / 2 > street.roadWidth / 2 + street.sidewalkWidth);
      for (const building of getLocalBuildings(street)) {
        const overlap = Math.abs(placed.plot[0] - building.plot[0]) < (width + building.footprint[0]) / 2 &&
          Math.abs(placed.plot[1] - building.plot[1]) < (depth + building.footprint[1]) / 2;
        assert.equal(overlap, false);
      }
    }
    for (let i = 0; i < streetPlots.length; i++) {
      for (let j = i + 1; j < streetPlots.length; j++) {
        assert.ok(
          Math.abs(streetPlots[i].plot[0] - streetPlots[j].plot[0]) >= width ||
          Math.abs(streetPlots[i].plot[1] - streetPlots[j].plot[1]) >= depth
        );
      }
    }
  }
  const secondStreet = streets[1];
  assert.equal(getLocalUtilities(secondStreet)[0].path[0][0], -55);
});

test('main-road auto-fix clears both clashes with one readable depth detour', () => {
  const street = getArea('bengaluru', 'uttarahalli').streets[0];
  const utilities = getLocalUtilities(street);
  const run: PlacedPipeRun = {
    id: 'main-road-water', type: 'water', color: '#0284c7', diameter: 0.8,
    defaultDepth: 2.5, waypoints: [
      { x: -1.5, z: -54, depth: 2.5 },
      { x: -1.5, z: 54, depth: 2.5 },
    ],
  };
  const clashes = scanAllClashes([run], utilities, street.id);
  assert.ok(clashes.length >= 2);
  const routed = rerouteRun(run, utilities, clashes[0]);
  assert.ok(routed.waypoints.length <= 8);
  assert.ok(routed.waypoints.every((wp: { depth: number }) => wp.depth <= 4));
  assert.equal(scanAllClashes([{ ...run, waypoints: routed.waypoints }], utilities, street.id).length, 0);
  assert.ok(routed.metrics.clearanceAfter >= 0.3);
});
