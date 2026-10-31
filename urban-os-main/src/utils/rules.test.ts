import test from 'node:test';
import assert from 'node:assert/strict';
import { gridSnap, gridSnap2D } from './gridSnap';
import { generatePipeGeometryData } from './pipeGenerator';
import { findClashes, PlacedPipeRun } from './clashDetection';
import { evaluateZoningCompliance } from './zoning';
import { calculateSunPosition } from './solar';
import { Utility } from '../dataHelpers';

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
