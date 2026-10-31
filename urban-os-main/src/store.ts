import { create } from 'zustand';
import {
  PROBLEM_CITY_ID,
  PROBLEM_AREA_ID,
  PROBLEM_STREET_ID,
  getCity,
  getArea,
  getStreet,
} from './dataHelpers';
import { PlacedPipeRun, ClashResult, findClashes } from './utils/clashDetection';
import { PlacedHouseData } from './utils/exportGeoJSON';
import { ZoningReport, evaluateZoningCompliance } from './utils/zoning';
import { HouseModelVariant, DEFAULT_HOUSE_MODELS } from './data/houseModels';
import { UserProfile } from './utils/supabase';
import { scanAllClashes, rerouteRun, estimateCost } from './utils/scanEngine';

export interface ArmedToolState {
  type: 'pipe' | 'house' | null;
  subType: string | null;
  mode?: 'draw' | 'vertical';
}

export interface DraftPipeRun {
  type: 'water' | 'gas' | 'fiber' | 'power';
  color: string;
  diameter: number;
  defaultDepth: number;
  waypoints: { x: number; z: number; depth: number }[];
}

export interface CADState {
  filename: string;
  bbox: {
    min: [number, number, number];
    max: [number, number, number];
  };
  meshData?: {
    positions: Float32Array;
    normals?: Float32Array;
    indices?: Uint32Array;
  };
  loading?: boolean;
  error?: string;
}

export interface AppStore {
  // Stage
  stage: 'landing' | 'auth' | 'portal' | 'select' | 'explore';
  setStage: (stage: 'landing' | 'auth' | 'portal' | 'select' | 'explore') => void;
  returnToLanding: () => void;
  openAuth: () => void;
  openPortal: () => void;

  // User Profile (Supabase / local fallback)
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  logout: () => void;

  // Wizard selections
  wizardCity: string;
  wizardArea: string;
  wizardStreet: string;
  setWizardCity: (cityId: string) => void;
  setWizardArea: (areaId: string) => void;
  setWizardStreet: (streetId: string) => void;
  confirmSelection: () => void;
  backToWizard: () => void;

  // Explore view
  cityId: string;
  areaId: string;
  streetId: string;
  setStreet: (streetId: string) => void;
  viewMode: '3d' | 'topdown' | 'single' | 'area';
  setViewMode: (mode: '3d' | 'topdown' | 'single' | 'area') => void;
  toggleViewMode: () => void;
  exploded: boolean;
  toggleExplode: () => void;
  setExploded: (val: boolean) => void;
  activeSidebarTab: 'tools' | 'directory';
  setActiveSidebarTab: (tab: 'tools' | 'directory') => void;

  // Armed tools
  armedTool: ArmedToolState;
  armTool: (tool: ArmedToolState) => void;
  disarmTool: () => void;

  // Pipe Builder
  currentPipeDepth: number;
  setCurrentPipeDepth: (depth: number) => void;
  draftPipeRun: DraftPipeRun | null;
  startPipeRun: (
    type: 'water' | 'gas' | 'fiber' | 'power',
    mode?: 'draw' | 'vertical'
  ) => void;
  addPipeWaypoint: (wp: { x: number; z: number; depth: number }) => void;
  updateLastDraftWaypoint: (wp: { x: number; z: number; depth: number }) => void;
  commitPipeRun: () => void;
  cancelPipeRun: () => void;
  newPipeRuns: Record<string, PlacedPipeRun[]>;
  removePipeRun: (streetId: string, runId: string) => void;

  // House Builder & Models Catalog
  houseModels: HouseModelVariant[];
  selectedHouseModelId: string;
  expandedPlotCategory: '20x30' | '30x40' | '40x60' | 'custom' | null;
  setExpandedPlotCategory: (category: '20x30' | '30x40' | '40x60' | 'custom' | null) => void;
  selectHouseModel: (modelId: string) => void;
  addCustomHouseModel: (model: HouseModelVariant) => void;
  newHouses: Record<string, PlacedHouseData[]>;
  placeHouse: (streetId: string, house: PlacedHouseData) => void;
  clearHouses: (streetId?: string) => void;
  removeHouse: (streetId: string, houseId: string) => void;
  updateHouseTransform: (
    streetId: string,
    houseId: string,
    transform: {
      rotation3D?: [number, number, number];
      plot?: [number, number];
      heightScale?: number;
      customHeight?: number;
    }
  ) => void;
  duplicateHouse: (streetId: string, houseId: string) => void;
  ghostRotation3D: [number, number, number];
  setGhostRotation3D: (rot: [number, number, number]) => void;
  rotateGhost: (axis: 'x' | 'y' | 'z', deltaDeg: number) => void;

  // CAD Guide & Upload Modal
  cadGuideOpen: boolean;
  setCADGuideOpen: (open: boolean) => void;

  // Selection
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;

  // Clashes
  clashes: ClashResult[];
  recalculateClashes: () => void;

  // Scan & Auto-Reroute
  scanResults: ClashResult[] | any[] | null;
  scanInProgress: boolean;
  rerouteMetrics: {
    clearanceBefore: number;
    clearanceAfter: number;
    lengthDelta: number;
    depthDelta: number;
    costEst: number;
  } | null;
  rerouteInProgress: boolean;
  runScan: () => void;
  autoFixAll: () => void;
  clearScan: () => void;
  clearRerouteMetrics: () => void;

  // CAD & Zoning
  zoningHeightLimit: number;
  setZoningHeightLimit: (limit: number) => void;
  cadModel: CADState | null;
  cadRenderMode: 'normal' | 'cad-blue';
  setCADRenderMode: (mode: 'normal' | 'cad-blue') => void;
  toggleCADRenderMode: () => void;
  convertCADToPermanentHouse: () => void;
  zoningReport: ZoningReport | null;
  setCADModel: (model: CADState | null) => void;
  setZoningReport: (report: ZoningReport | null) => void;
  clearCAD: () => void;

  // Solar & Time
  solarTime: number; // e.g. 15.0 for 3:00 PM
  setSolarTime: (time: number) => void;
  shadowedPanels: number[];
  setShadowedPanels: (panels: number[]) => void;

  // Toast
  toast: string | null;
  setToast: (msg: string | null) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // Stage defaults
  stage: 'landing',
  setStage: (stage) => set({ stage }),
  returnToLanding: () => set({ stage: 'landing' }),
  openAuth: () => set({ stage: 'auth' }),
  openPortal: () => set({ stage: 'portal' }),

  // User Profile
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
  logout: () => {
    localStorage.removeItem('bengaluru_twin_user');
    set({ currentUser: null, stage: 'landing' });
  },

  // Defaults preselected for instant 1-click entry
  wizardCity: PROBLEM_CITY_ID,
  wizardArea: PROBLEM_AREA_ID,
  wizardStreet: PROBLEM_STREET_ID,

  setWizardCity: (cityId) => {
    const city = getCity(cityId);
    const firstArea = city.areas[0]?.id || '';
    const firstStreet = city.areas[0]?.streets[0]?.id || '';
    set({
      wizardCity: cityId,
      wizardArea: firstArea,
      wizardStreet: firstStreet,
    });
  },

  setWizardArea: (areaId) => {
    const area = getArea(get().wizardCity, areaId);
    const firstStreet = area.streets[0]?.id || '';
    set({
      wizardArea: areaId,
      wizardStreet: firstStreet,
    });
  },

  setWizardStreet: (streetId) => set({ wizardStreet: streetId }),

  confirmSelection: () => {
    const state = get();
    set({
      cityId: state.wizardCity,
      areaId: state.wizardArea,
      streetId: state.wizardStreet,
      stage: 'explore',
      armedTool: { type: null, subType: null },
      draftPipeRun: null,
      toast: `Loaded ${state.wizardStreet}. Explode view and CAD tools ready.`,
    });
    get().recalculateClashes();
  },

  backToWizard: () => {
    set({
      stage: 'select',
      armedTool: { type: null, subType: null },
      draftPipeRun: null,
      selectedObjectId: null,
    });
    document.body.style.cursor = 'default';
  },

  // Explore view defaults
  cityId: PROBLEM_CITY_ID,
  areaId: PROBLEM_AREA_ID,
  streetId: PROBLEM_STREET_ID,
  setStreet: (streetId) => {
    set({
      streetId,
      selectedObjectId: null,
      draftPipeRun: null,
      armedTool: { type: null, subType: null },
    });
    get().recalculateClashes();
  },

  viewMode: '3d',
  setViewMode: (viewMode) => set({ viewMode }),
  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === 'area' ? '3d' : 'area',
    })),

  activeSidebarTab: 'tools',
  setActiveSidebarTab: (activeSidebarTab) => set({ activeSidebarTab }),

  exploded: false,
  toggleExplode: () => set((state) => ({ exploded: !state.exploded })),
  setExploded: (exploded) => set({ exploded }),

  // Tool armament
  armedTool: { type: null, subType: null },
  armTool: (tool) => {
    set({ armedTool: tool });
    document.body.style.cursor = tool.type ? 'crosshair' : 'default';
  },
  disarmTool: () => {
    set({
      armedTool: { type: null, subType: null },
      draftPipeRun: null,
      viewMode: '3d',
    });
    document.body.style.cursor = 'default';
  },

  // Pipe Builder
  currentPipeDepth: 2.5,
  setCurrentPipeDepth: (currentPipeDepth) => set({ currentPipeDepth }),
  draftPipeRun: null,

  startPipeRun: (type, mode = 'draw') => {
    let color = '#0284c7';
    let diameter = 0.8;
    let defaultDepth = 2.5;

    if (type === 'gas') {
      color = '#f59e0b';
      diameter = 0.45;
      defaultDepth = 1.8;
    } else if (type === 'fiber') {
      color = '#d946ef';
      diameter = 0.25;
      defaultDepth = 0.9;
    } else if (type === 'power') {
      color = '#dc2626';
      diameter = 0.35;
      defaultDepth = 1.4;
    }

    set({
      currentPipeDepth: defaultDepth,
      viewMode: 'topdown',
      draftPipeRun: {
        type,
        color,
        diameter,
        defaultDepth,
        waypoints: [],
      },
      armedTool: { type: 'pipe', subType: type, mode },
      toast:
        mode === 'draw'
          ? `Click ground to place waypoints · Enter/DblClick to commit · Esc to cancel`
          : `Click ground to drop vertical riser · Esc to cancel`,
    });
    document.body.style.cursor = 'crosshair';
  },

  addPipeWaypoint: (wp) => {
    const draft = get().draftPipeRun;
    if (!draft) return;
    const newWaypoints = [...draft.waypoints, wp];
    set({
      draftPipeRun: {
        ...draft,
        waypoints: newWaypoints,
      },
      toast: `Waypoint ${newWaypoints.length} added at (${wp.x.toFixed(1)}, ${wp.z.toFixed(1)}, depth -${wp.depth.toFixed(1)}m)`,
    });
  },

  updateLastDraftWaypoint: (wp) => {
    const draft = get().draftPipeRun;
    if (!draft || draft.waypoints.length === 0) return;
    const waypoints = [...draft.waypoints];
    waypoints[waypoints.length - 1] = wp;
    set({ draftPipeRun: { ...draft, waypoints } });
  },

  commitPipeRun: () => {
    const { draftPipeRun, streetId, newPipeRuns } = get();
    if (!draftPipeRun || draftPipeRun.waypoints.length < 2) {
      set({
        draftPipeRun: null,
        armedTool: { type: null, subType: null },
        toast: 'Pipe run cancelled (requires at least 2 points)',
      });
      document.body.style.cursor = 'default';
      return;
    }

    const currentRuns = newPipeRuns[streetId] || [];
    const newRun: PlacedPipeRun = {
      id: `pipe-run-${Date.now()}`,
      type: draftPipeRun.type,
      color: draftPipeRun.color,
      diameter: draftPipeRun.diameter,
      defaultDepth: draftPipeRun.defaultDepth,
      waypoints: draftPipeRun.waypoints,
      status: 'committed',
    };

    set({
      newPipeRuns: {
        ...newPipeRuns,
        [streetId]: [...currentRuns, newRun],
      },
      draftPipeRun: null,
      armedTool: { type: null, subType: null },
      viewMode: '3d',
      toast: `Committed ${draftPipeRun.type.toUpperCase()} run (${draftPipeRun.waypoints.length} waypoints)`,
    });
    document.body.style.cursor = 'default';
    get().recalculateClashes();
  },

  cancelPipeRun: () => {
    set({
      draftPipeRun: null,
      armedTool: { type: null, subType: null },
      viewMode: '3d',
      toast: 'Pipe run cancelled',
    });
    document.body.style.cursor = 'default';
  },

  newPipeRuns: {},
  removePipeRun: (streetId, runId) => {
    const runs = get().newPipeRuns[streetId] || [];
    set({
      newPipeRuns: {
        ...get().newPipeRuns,
        [streetId]: runs.filter((r) => r.id !== runId),
      },
      selectedObjectId: null,
      toast: 'Pipe run removed',
    });
    get().recalculateClashes();
  },

  // House Builder & Models Catalog
  houseModels: DEFAULT_HOUSE_MODELS,
  selectedHouseModelId: '20x30-nilaya',
  expandedPlotCategory: '20x30', // default open 20x30 so user immediately sees available models!
  setExpandedPlotCategory: (expandedPlotCategory) => set({ expandedPlotCategory }),

  selectHouseModel: (modelId) => {
    const model = get().houseModels.find((m) => m.id === modelId);
    if (!model) return;
    set({
      selectedHouseModelId: modelId,
      armedTool: { type: 'house', subType: model.category },
      toast: `Armed ${model.name} (${model.category} FT) · Click ground plot to place · Esc to cancel`,
    });
    document.body.style.cursor = 'crosshair';
  },

  addCustomHouseModel: (model) => {
    set((state) => ({
      houseModels: [model, ...state.houseModels],
      selectedHouseModelId: model.id,
      expandedPlotCategory: model.category,
      armedTool: { type: 'house', subType: model.category },
      toast: `Custom CAD Model "${model.name}" ready to place on ${model.category} plots!`,
    }));
    document.body.style.cursor = 'crosshair';
  },

  cadGuideOpen: false,
  setCADGuideOpen: (cadGuideOpen) => set({ cadGuideOpen }),

  newHouses: {},
  placeHouse: (streetId, house) => {
    const currentHouses = get().newHouses[streetId] || [];
    const model = get().houseModels.find((m) => m.id === house.modelId) ||
                  get().houseModels.find((m) => m.category === house.type);
    const modelName = model ? model.name : `${house.type} FT`;

    set({
      newHouses: {
        ...get().newHouses,
        [streetId]: [...currentHouses, { ...house, modelId: model?.id }],
      },
      toast: `Placed ${modelName} at (${house.plot[0].toFixed(1)}, ${house.plot[1].toFixed(1)})`,
    });
  },

  clearHouses: (streetId) => {
    const target = streetId || get().streetId;
    set({
      newHouses: {
        ...get().newHouses,
        [target]: [],
      },
      selectedObjectId: null,
      toast: 'Cleared all placed houses',
    });
  },

  removeHouse: (streetId, houseId) => {
    const houses = get().newHouses[streetId] || [];
    set({
      newHouses: {
        ...get().newHouses,
        [streetId]: houses.filter((h) => h.id !== houseId),
      },
      selectedObjectId: null,
      toast: 'House removed',
    });
  },

  updateHouseTransform: (streetId, houseId, transform) => {
    const houses = get().newHouses[streetId] || [];
    set({
      newHouses: {
        ...get().newHouses,
        [streetId]: houses.map((h) => {
          if (h.id !== houseId) return h;
          const next = { ...h, ...transform };
          if (transform.rotation3D) {
            next.rotation = (transform.rotation3D[1] * Math.PI) / 180;
          }
          return next;
        }),
      },
    });
  },

  duplicateHouse: (streetId, houseId) => {
    const houses = get().newHouses[streetId] || [];
    const source = houses.find((h) => h.id === houseId);
    if (!source) return;
    const newId = `house-${Date.now()}`;
    const duplicated: PlacedHouseData = {
      ...source,
      id: newId,
      plot: [source.plot[0] + 5, source.plot[1]],
    };
    set({
      newHouses: {
        ...get().newHouses,
        [streetId]: [...houses, duplicated],
      },
      selectedObjectId: newId,
      toast: `Duplicated house to (${duplicated.plot[0].toFixed(1)}, ${duplicated.plot[1].toFixed(1)})`,
    });
  },

  ghostRotation3D: [0, 0, 0],
  setGhostRotation3D: (ghostRotation3D) => set({ ghostRotation3D }),
  rotateGhost: (axis, deltaDeg) => {
    const cur = get().ghostRotation3D;
    const next: [number, number, number] = [...cur];
    if (axis === 'x') next[0] = (next[0] + deltaDeg) % 360;
    if (axis === 'y') next[1] = (next[1] + deltaDeg + 360) % 360;
    if (axis === 'z') next[2] = (next[2] + deltaDeg) % 360;
    set({ ghostRotation3D: next });
  },

  // Selection
  selectedObjectId: null,
  setSelectedObjectId: (selectedObjectId) => set({ selectedObjectId }),

  // Clash calculation
  clashes: [],
  recalculateClashes: () => {
    const state = get();
    const currentStreet = getStreet(state.cityId, state.areaId, state.streetId);
    const runs = state.newPipeRuns[state.streetId] || [];
    const clashes = findClashes(currentStreet.utilities || [], runs);
    set({ clashes });
  },

  // Scan & Auto-Reroute
  scanResults: null,
  scanInProgress: false,
  rerouteMetrics: null,
  rerouteInProgress: false,

  runScan: () => {
    set({ scanInProgress: true });
    const state = get();
    const currentStreet = getStreet(state.cityId, state.areaId, state.streetId);
    const results = scanAllClashes(state.newPipeRuns, currentStreet.utilities || [], state.streetId);
    set({
      scanResults: results,
      clashes: results,
      scanInProgress: false,
      toast:
        results.length > 0
          ? `Scan complete: ${results.length} 3D clash${results.length > 1 ? 'es' : ''} detected!`
          : `Scan complete: All clear! 0 clashes detected.`,
    });
  },

  autoFixAll: () => {
    const { scanResults, newPipeRuns, streetId, cityId, areaId } = get();
    if (!scanResults || scanResults.length === 0) return;

    set({ rerouteInProgress: true });
    const currentStreet = getStreet(cityId, areaId, streetId);
    const existingUtils = currentStreet.utilities || [];

    const clashingRunIds = new Set(scanResults.map((c: any) => c.runId));
    const currentStreetRuns = newPipeRuns[streetId] || [];

    const updatedRuns = [...currentStreetRuns];
    let totalLengthDelta = 0;
    let totalDepthDelta = 0;
    let minClearanceBefore = 0;
    let maxClearanceAfter = 0.45;

    for (let i = 0; i < updatedRuns.length; i++) {
      const run = updatedRuns[i];
      if (!clashingRunIds.has(run.id)) continue;

      const runClashes = scanResults.filter((c: any) => c.runId === run.id);
      let currentRun = run;
      for (const clash of runClashes) {
        const { waypoints, metrics } = rerouteRun(currentRun, existingUtils, clash);
        currentRun = { ...currentRun, waypoints };
        if (metrics) {
          totalLengthDelta += metrics.lengthDelta || 0;
          totalDepthDelta += Math.abs(metrics.depthDelta || 0);
          minClearanceBefore = Math.min(minClearanceBefore, metrics.clearanceBefore || -0.15);
          maxClearanceAfter = Math.max(maxClearanceAfter, metrics.clearanceAfter || 0.45);
        }
      }
      updatedRuns[i] = currentRun;
    }

    set({
      newPipeRuns: {
        ...newPipeRuns,
        [streetId]: updatedRuns,
      },
    });

    setTimeout(() => {
      const state = get();
      const st = getStreet(state.cityId, state.areaId, state.streetId);
      const newClashes = scanAllClashes(state.newPipeRuns, st.utilities || [], state.streetId);

      const aggregatedMetrics = {
        clearanceBefore: minClearanceBefore < 0 ? minClearanceBefore : -0.15,
        clearanceAfter: maxClearanceAfter > 0 ? maxClearanceAfter : 0.45,
        lengthDelta: Number(totalLengthDelta.toFixed(1)),
        depthDelta: Number(totalDepthDelta.toFixed(1)),
        costEst: estimateCost(totalLengthDelta, totalDepthDelta),
      };

      set({
        scanResults: newClashes,
        clashes: newClashes,
        rerouteMetrics: aggregatedMetrics,
        rerouteInProgress: false,
        toast:
          newClashes.length === 0
            ? `Auto-reroute complete: All clashes resolved!`
            : `Auto-reroute partial: ${newClashes.length} remaining`,
      });
    }, 750);
  },

  clearScan: () => set({ scanResults: null }),
  clearRerouteMetrics: () => set({ rerouteMetrics: null }),

  // CAD & Zoning
  zoningHeightLimit: 30.0, // Default BBMP 30m, fully adjustable in real-time
  setZoningHeightLimit: (zoningHeightLimit) => {
    set({ zoningHeightLimit });
    const cad = get().cadModel;
    if (cad && cad.bbox) {
      const report = evaluateZoningCompliance(cad.bbox, [20, 0, -18], 24, 20, zoningHeightLimit);
      set({ zoningReport: report });
    }
  },
  cadModel: null,
  cadRenderMode: 'normal',
  setCADRenderMode: (cadRenderMode) => set({ cadRenderMode }),
  toggleCADRenderMode: () =>
    set((state) => ({ cadRenderMode: state.cadRenderMode === 'normal' ? 'cad-blue' : 'normal' })),
  convertCADToPermanentHouse: () => {
    const state = get();
    const cad = state.cadModel;
    if (!cad) return;

    const street = getStreet(state.cityId, state.areaId, state.streetId);
    const center = street.emptyPlotCenter || [20, 0, -18];

    const h = cad.bbox.max[1] - cad.bbox.min[1];
    const w = cad.bbox.max[0] - cad.bbox.min[0];
    const d = cad.bbox.max[2] - cad.bbox.min[2];
    const cat = Math.max(w, d) > 15 ? '40x60' : Math.max(w, d) > 10 ? '30x40' : '20x30';

    const houseModelId = `custom-model-${Date.now()}`;
    const newVariant: HouseModelVariant = {
      id: houseModelId,
      category: cat,
      name: cad.filename.replace(/\.[^/.]+$/, ''),
      subtitle: `Placed House Model (${w.toFixed(0)}×${d.toFixed(0)}m)`,
      sqft: Math.round(w * d * 10.764),
      floors: Math.max(1, Math.round(h / 3.0)),
      footprint: [w, d],
      height: h,
      style: 'custom-cad',
      description: `Permanent residential architecture from CAD upload (${cad.filename}).`,
      features: ['Realistic Architecture', 'Permanent Placed House', 'Full 3-Axis Rotation'],
      isCustom: true,
      meshPositions: cad.meshData?.positions,
      meshNormals: cad.meshData?.normals,
      meshIndices: cad.meshData?.indices,
    };

    state.addCustomHouseModel(newVariant);

    const houseId = `house-cad-${Date.now()}`;
    state.placeHouse(state.streetId, {
      id: houseId,
      type: cat,
      modelId: houseModelId,
      plot: [center[0], center[2]],
      rotation: 0,
      rotation3D: [0, 0, 0],
      customHeight: h,
    });

    set({
      cadModel: null,
      zoningReport: null,
      selectedObjectId: houseId,
      toast: `Fixed & placed "${cad.filename}" permanently as a real house! Select to rotate or adjust.`,
    });
  },
  zoningReport: null,
  setCADModel: (cadModel) => {
    set({ cadModel });
    if (cadModel && cadModel.bbox) {
      const report = evaluateZoningCompliance(cadModel.bbox, [20, 0, -18], 24, 20, get().zoningHeightLimit);
      set({ zoningReport: report });
    }
  },
  setZoningReport: (zoningReport) => set({ zoningReport }),
  clearCAD: () => set({ cadModel: null, zoningReport: null }),

  // Solar & Time
  solarTime: 15.0, // 3:00 PM
  setSolarTime: (solarTime) => set({ solarTime }),
  shadowedPanels: [],
  setShadowedPanels: (shadowedPanels) => set({ shadowedPanels }),

  // Toast
  toast: null,
  setToast: (toast) => set({ toast }),
}));
