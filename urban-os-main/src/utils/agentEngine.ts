import { useStore } from '../store';
import { getStreet, getLocalUtilities } from '../dataHelpers';
import { findClashes, PlacedPipeRun } from './clashDetection';

export interface AgentActionContext {
  setPendingAgentPlacement?: (placement: { count: number; type: string } | null) => void;
  clearHouses?: (streetId?: string) => void;
  startPipeRun?: (type: 'water' | 'gas' | 'fiber' | 'power', mode?: 'draw' | 'vertical') => void;
  addPipeWaypoint?: (wp: { x: number; z: number; depth: number }) => void;
  commitPipeRun?: () => void;
}

export async function parseCommand(
  text: string,
  state: any = useStore.getState(),
  actions: AgentActionContext = useStore.getState()
): Promise<string> {
  const lower = text.trim().toLowerCase();
  const streetId = state.streetId || 'mg-road';
  const street = getStreet(state.cityId, state.areaId, streetId);

  // RULE 1: Place N houses
  if (lower.includes('place') && (lower.includes('house') || lower.includes('houses'))) {
    const numMatch = lower.match(/\d+/);
    const count = numMatch ? Math.min(100, Math.max(1, parseInt(numMatch[0], 10))) : 10;
    const type = lower.match(/(?:20x30|30x40|40x60)/)?.[0] || '30x40';
    (actions.setPendingAgentPlacement || useStore.getState().setPendingAgentPlacement)({ count, type });
    return `Ready to place ${count} houses. Click the map to set the origin point.`;
  }

  // RULE 2: Pipe [type] from [start] to [end]
  if (lower.includes('pipe') && lower.includes('from') && lower.includes('to')) {
    let type: 'water' | 'gas' | 'fiber' | 'power' = 'water';
    if (lower.includes('gas')) type = 'gas';
    else if (lower.includes('fiber')) type = 'fiber';
    else if (lower.includes('power')) type = 'power';

    const depth = type === 'gas' ? 1.8 : type === 'fiber' ? 0.9 : type === 'power' ? 1.4 : 2.5;
    const xOffset = type === 'gas' ? 2.5 : type === 'fiber' ? -3.0 : type === 'power' ? 3.5 : -1.5;
    const halfLen = (street.length || 150) / 2 - 6;

    (actions.startPipeRun || useStore.getState().startPipeRun)(type, 'draw');
    const waypoints = [
      { x: xOffset, z: -halfLen, depth },
      { x: xOffset, z: halfLen, depth },
    ];
    if (waypoints.every((wp) => Number.isFinite(wp.x) && Number.isFinite(wp.z) && Number.isFinite(wp.depth)) &&
        Math.hypot(waypoints[1].x - waypoints[0].x, waypoints[1].z - waypoints[0].z) > 0.05) {
      for (const wp of waypoints) {
        (actions.addPipeWaypoint || useStore.getState().addPipeWaypoint)(wp);
      }
      (actions.commitPipeRun || useStore.getState().commitPipeRun)();
    } else {
      useStore.getState().cancelPipeRun();
      return 'Could not form a valid pipe route.';
    }

    // Check clashes immediately after placement
    const updatedStore = useStore.getState();
    const runs: PlacedPipeRun[] = updatedStore.newPipeRuns[streetId] || [];
    const clashes = findClashes(getLocalUtilities(street), runs);
    updatedStore.recalculateClashes();

    if (clashes.length > 0) {
      return `Warning: Plan executed but created ${clashes.length} clashes. Click SCAN to fix.`;
    }
    return 'Success. Pipe routed safely.';
  }

  // RULE 3: Clear all placed houses
  if (lower.includes('clear') || lower.includes('remove all')) {
    if (actions.clearHouses) {
      actions.clearHouses(streetId);
    } else {
      useStore.getState().clearHouses(streetId);
    }
    return 'Cleared all placed houses.';
  }

  // Default Guidance
  return `Command not recognized. Try:\n• 'place 20 houses'\n• 'pipe water from start to end'\n• 'clear all'`;
}
