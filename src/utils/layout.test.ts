import test from 'node:test';
import assert from 'node:assert/strict';
import { useStore } from '../store';
import { registerLayoutGroup, getRegisteredLayoutGroup } from './layoutExport';
import * as THREE from 'three';

test('useStore layoutMode defaults to explore and toggles cleanly', () => {
  const store = useStore.getState();
  assert.equal(store.layoutMode, 'explore');

  store.setLayoutMode('create');
  assert.equal(useStore.getState().layoutMode, 'create');

  store.setLayoutMode('explore');
  assert.equal(useStore.getState().layoutMode, 'explore');
});

test('useStore addLayoutItem adds items to the center of grid with proper IDs and defaults', () => {
  const store = useStore.getState();
  store.clearLayoutItems();

  // Add House
  store.addLayoutItem('House');
  let items = useStore.getState().layoutItems;
  assert.equal(items.length, 1);
  assert.equal(items[0].type, 'House');
  assert.equal(items[0].position[0], 0);
  assert.equal(items[0].position[2], 0);
  assert.ok(items[0].position[1] > 0); // Sits on top of y=0 grid

  // Add Park, Road, Water Pipe
  store.addLayoutItem('Park');
  store.addLayoutItem('Road');
  store.addLayoutItem('Water Pipe');

  items = useStore.getState().layoutItems;
  assert.equal(items.length, 4);
  assert.equal(items[1].type, 'Park');
  assert.equal(items[2].type, 'Road');
  assert.equal(items[3].type, 'Water Pipe');
});

test('useStore updateLayoutItem modifies position, rotation, and scale', () => {
  const store = useStore.getState();
  const items = store.layoutItems;
  const targetId = items[0].id;

  store.updateLayoutItem(targetId, {
    position: [12.5, 3.0, -8.0],
    rotation: [0, Math.PI / 2, 0],
    scale: [1.5, 1.5, 1.5],
  });

  const updated = useStore.getState().layoutItems.find((i) => i.id === targetId);
  assert.ok(updated);
  assert.deepEqual(updated.position, [12.5, 3.0, -8.0]);
  assert.deepEqual(updated.rotation, [0, Math.PI / 2, 0]);
  assert.deepEqual(updated.scale, [1.5, 1.5, 1.5]);
});

test('useStore removeLayoutItem deletes item cleanly', () => {
  const store = useStore.getState();
  const initialCount = store.layoutItems.length;
  const targetId = store.layoutItems[0].id;

  store.removeLayoutItem(targetId);
  const remaining = useStore.getState().layoutItems;
  assert.equal(remaining.length, initialCount - 1);
  assert.ok(!remaining.some((i) => i.id === targetId));
});

test('registerLayoutGroup stores and retrieves THREE.Group for GLTFExporter', () => {
  const group = new THREE.Group();
  group.name = 'TestExportGroup';
  registerLayoutGroup(group);

  const retrieved = getRegisteredLayoutGroup();
  assert.equal(retrieved, group);
  assert.equal(retrieved?.name, 'TestExportGroup');

  registerLayoutGroup(null);
  assert.equal(getRegisteredLayoutGroup(), null);
});
