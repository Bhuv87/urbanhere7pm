import { useStore } from '../store';
import { getStreet } from '../dataHelpers';
import { findClashes, PlacedPipeRun } from './clashDetection';
import { PlacedHouseData } from './exportGeoJSON';

export interface AgentActionContext {
  placeHouse?: (streetId: string, house: PlacedHouseData) => void;
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
    const categories: Array<'20x30' | '30x40' | '40x60'> = ['20x30', '30x40', '40x60'];

    const roadHalf = (street.roadWidth || 14) / 2;
    const streetLength = street.length || 150;
    const zMin = -streetLength / 2 + 10;
    const zMax = streetLength / 2 - 10;
    const zSpan = zMax - zMin;

    for (let i = 0; i < count; i++) {
      const cat = categories[i % categories.length];
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 10);
      const x = side * (roadHalf + 6 + row * 8);
      const z = zMin + ((i % 10) / 10) * zSpan + (Math.random() * 3 - 1.5);
      const rot = side > 0 ? -Math.PI / 2 : Math.PI / 2;

      const house: PlacedHouseData = {
        id: `house-agent-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        type: cat,
        plot: [Number(x.toFixed(1)), Number(z.toFixed(1))],
        rotation: rot,
        rotation3D: [0, Math.round((rot * 180) / Math.PI), 0],
      };

      if (actions.placeHouse) {
        actions.placeHouse(streetId, house);
      } else {
        useStore.getState().placeHouse(streetId, house);
      }
    }

    return `Placed ${count} houses. Check the view.`;
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

    const startRun = actions.startPipeRun || useStore.getState().startPipeRun;
    const addWaypoint = actions.addPipeWaypoint || useStore.getState().addPipeWaypoint;
    const commitRun = actions.commitPipeRun || useStore.getState().commitPipeRun;

    startRun(type, 'draw');
    addWaypoint({ x: xOffset, z: -halfLen, depth });
    addWaypoint({ x: xOffset, z: halfLen, depth });
    commitRun();

    // Check clashes immediately after placement
    const updatedStore = useStore.getState();
    const runs: PlacedPipeRun[] = updatedStore.newPipeRuns[streetId] || [];
    const clashes = findClashes(street.utilities || [], runs);
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
