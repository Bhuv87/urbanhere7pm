import React, { useState } from 'react';
import { audioFX } from './AudioFX';

interface FeatureItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  spec: string;
  description: string;
  visualBadge: string;
  points: string[];
  techStat: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'explode',
    tag: 'FEATURE 01 // KINEMATICS',
    title: '8-METER VERTICAL SUBTERRANEAN EXPLODE',
    subtitle: 'Decouple Road Bedrock from Surface Topography',
    spec: 'GSAP Power3.inOut   60 FPS Matrix Transform',
    description:
      'Instantly lift the entire surface layer—asphalt road slabs, pedestrian footpaths, kerb trim, and building plots—8 meters into the air with smooth exponential easing. Inspect the unvarnished underground trench, earth shoring sheet piles, and depth benchmarks (-0.9m to -2.5m).',
    visualBadge: '8.0m VERTICAL LIFT',
    points: [
      'Volumetric shoring retaining walls and compacted crushed stone bedding',
      'Depth gauge wall markers at -0.9m, -1.4m, -1.8m, and -2.5m depth',
      'Subsurface inspection spot illumination along the excavation bed',
      'Instant toggle between collapsed sealed road and exploded inspection',
    ],
    techStat: '1.2s Eased Transition',
  },
  {
    id: 'clash',
    tag: 'FEATURE 02 // SPATIAL AUDIT',
    title: 'SUB-MILLIMETER 3D SPATIAL CLASH DETECTION',
    subtitle: 'Zero Unplanned Slices: 0.3m Safety Clearance Guard',
    spec: 'Vector Dot Product Segment Distance Math',
    description:
      'Never slice a high-pressure gas line or fiber feeder again. Our spatial algorithm computes 3D Euclidean distances between new proposed pipe runs and existing utility networks, instantly flagging collisions with pulsing red warning toruses and distance callouts.',
    visualBadge: '< 0.3m SAFETY BUFFER',
    points: [
      'Multi-agency compliance: BWSSB Water, GAIL Gas, Telecom Fiber, BESCOM 11kV',
      'Real-time recalculation as waypoints are placed or dragged',
      'Subterranean 3D clash badges indicating exact collision distance',
      'Active warning ticker in top navigation bar alerting field planners',
    ],
    techStat: '0.001m Distance Precision',
  },
  {
    id: 'models',
    tag: 'FEATURE 03 // ARCHITECTURE',
    title: '11 BENGALURU HOUSE ARCHITECTURAL TYPOLOGIES',
    subtitle: '20x30, 30x40 & 40x60 FT Standard Bengaluru Sites',
    spec: 'Procedural Mesh Groups   Fusion 360 Direct Models',
    description:
      'Pick from 11 meticulously modeled regional architectures: traditional Nilaya duplexes with rooftop Sintex water tanks, heritage Mangalore tile sloped roofs, modern stilt parking villas, courtyard Thotti Mane, Fusion 360 asymmetric cottages, and G+4 skyline luxury towers.',
    visualBadge: '11 REGIONAL MODELS',
    points: [
      'Fusion Asymmetric Gable Cottage with masonry chimney, pergolas, and teak deck',
      'Fusion Modern Villa with sunken outdoor fire-pit lounge and turquoise lap pool',
      'Skyline Luxury Multi-Story Apartments with stilt parking, lobby & glass elevator',
      'Independent 3-axis rotation (Yaw heading, Pitch slope, Roll cant)',
    ],
    techStat: '600 to 2,400 SQFT Plots',
  },
  {
    id: 'cad',
    tag: 'FEATURE 04 // BIM IN-BROWSER',
    title: 'CLIENT-SIDE WASM / STEP & CAD GEOMETRY PARSER',
    subtitle: 'Import Native .STEP, .STP, .STL, .OBJ, .GLTF Files',
    spec: '100% In-Browser   Zero Server Upload   Zero Leaks',
    description:
      'Drag and drop any custom 3D model exported from AutoCAD, Revit, Fusion 360, SolidWorks, or Rhino directly into your browser. Our hybrid WASM / pure-JS STEP parser normalizes units from mm to meters, calculates bounding boxes, and checks BBMP zoning compliance.',
    visualBadge: '.STEP .STP .STL .OBJ',
    points: [
      'Millimeter-to-meter auto-scaling (handles 6000mm -> 6.0m conversions)',
      'BBMP municipal height ceiling slider (11.5m to 60m) with live visual datum plane',
      'Automatic 3.0m perimeter setback violation audit with detailed pass/fail report',
      'One-click "Fix as House" feature to permanently mount CAD onto any plot',
    ],
    techStat: 'WASM Accelerated',
  },
  {
    id: 'solar',
    tag: 'FEATURE 05 // SOLAR SIMULATION',
    title: 'SUNCALC 12.9716° N BENGALURU EPHEMERIS',
    subtitle: 'Real-Time Solar Altitude, Azimuth & Shadow Raycasting',
    spec: 'Exact Bengaluru Geolocation: 12.9716° N, 77.5946° E',
    description:
      'Simulate the sun’s exact celestial path over Bengaluru at any hour from 06:00 AM to 06:00 PM. High-precision raycasts detect shadow occlusions cast by neighboring towers onto rooftop 24-panel photovoltaic arrays, reporting live efficiency percentage.',
    visualBadge: '12.9716° N EPHEMERIS',
    points: [
      'SunCalc astronomical ephemeris calculated for Bengaluru coordinates',
      'Directional key light tracks solar altitude, azimuth, and intensity dynamically',
      '24-panel monocrystalline rooftop photovoltaic array with live cell status',
      'Real-time array efficiency progress bar (full sun vs shadowed cells)',
    ],
    techStat: '06:00 AM — 06:00 PM Scrub',
  },
  {
    id: 'export',
    tag: 'FEATURE 06 // GIS EXPORT',
    title: 'WGS84 GEOJSON & 2400x1600 CAD BLUEPRINT EXPORT',
    subtitle: 'Interoperability for QGIS, ArcGIS, and Field Contractors',
    spec: 'EPSG:4326 Datum   High-Res Canvas Rasterization',
    description:
      'Export your newly routed utilities, placed buildings, and plot coordinates directly into standard WGS84 GeoJSON for consumption in GIS systems like QGIS or ArcGIS. Generate high-resolution 2400x1600 PNG blueprints with complete technical legend and title blocks.',
    visualBadge: 'WGS84 & 2400x1600',
    points: [
      'Export placed houses as GeoJSON polygon features with area metadata',
      'Export pipe runs as LineString features with diameter, depth, and agency specs',
      '2400x1600 PNG blueprint generator with solid white CAD styling & title blocks',
      'Direct compatibility with geojson.io and municipal planning servers',
    ],
    techStat: 'Full GIS Interoperability',
  },
];

export const FeatureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('explode');
  const activeFeature = FEATURES.find((f) => f.id === activeTab) || FEATURES[0];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    audioFX.playClick(1400);
  };

  return (
    <section id="features" className="py-16 md:py-24 bg-white border-b-2 border-black select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="border-b-2 border-black pb-4 mb-8">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#dc0000] uppercase tracking-widest mb-1.5">
            <span>// 03. CORE TECHNICAL CAPABILITIES</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black">
            ENGINEERED FOR REAL FIELD UTILITY
          </h2>
          <p className="font-mono text-xs md:text-sm text-[#555555] mt-2 max-w-2xl leading-relaxed">
            Six architectural pillars delivering uncompromised 3D spatial fidelity, clash prevention, and municipal compliance directly in any web browser.
          </p>
        </div>

        {/* Feature Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8 font-mono text-xs">
          {FEATURES.map((feat, idx) => (
            <button
              key={feat.id}
              onClick={() => handleSelectTab(feat.id)}
              className={`p-2.5 text-left border-2 border-black transition-none cursor-pointer flex flex-col justify-between h-20 ${
                activeTab === feat.id
                  ? 'bg-[#dc0000] text-white hard-shadow'
                  : 'bg-[#f8fafc] text-black hover:bg-[#e2e8f0]'
              }`}
            >
              <span className="text-[10px] font-bold opacity-80">0{idx + 1} //</span>
              <span className="font-bold uppercase text-[11px] leading-tight line-clamp-2">
                {feat.id === 'explode'
                  ? '8m Explode'
                  : feat.id === 'clash'
                  ? 'Clash Radar'
                  : feat.id === 'models'
                  ? '11 Models'
                  : feat.id === 'cad'
                  ? 'WASM CAD'
                  : feat.id === 'solar'
                  ? 'SunCalc Solar'
                  : 'GIS Export'}
              </span>
            </button>
          ))}
        </div>

        {/* Active Feature Deep Dive Card */}
        <div className="border-2 border-black bg-[#f8fafc] hard-shadow p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Spec & Breakdown */}
          <div className="lg:col-span-7 space-y-5">
            <div className="border-b border-black pb-3">
              <span className="font-mono text-[11px] bg-black text-white px-2 py-0.5 font-bold uppercase tracking-wider">
                {activeFeature.tag}
              </span>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mt-2.5">
                {activeFeature.title}
              </h3>
              <div className="font-mono text-xs font-bold text-[#dc0000] uppercase mt-1">
                {activeFeature.subtitle}
              </div>
            </div>

            <p className="text-sm md:text-base text-[#333333] leading-relaxed font-sans">
              {activeFeature.description}
            </p>

            {/* Checklist items */}
            <div className="space-y-2 pt-2">
              <div className="font-mono text-xs font-bold text-black uppercase">
                ENGINEERING HIGHLIGHTS:
              </div>
              <ul className="space-y-1.5 font-mono text-xs text-[#444444]">
                {activeFeature.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#dc0000] font-bold">✔</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Visual Telemetry Card */}
          <div className="lg:col-span-5 bg-white border-2 border-black p-5 hard-shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-black">
                <span className="font-mono text-xs font-bold uppercase text-black">
                  TECHNICAL BENCHMARK
                </span>
                <span className="font-mono text-[10px] bg-[#00aaff] text-white px-1.5 py-0.5 font-bold uppercase">
                  VERIFIED
                </span>
              </div>

              <div className="my-6 text-center py-4 bg-[#f1f5f9] border border-black">
                <div className="font-mono text-3xl md:text-4xl font-black text-black">
                  {activeFeature.visualBadge}
                </div>
                <div className="font-mono text-[11px] text-[#666666] uppercase mt-1">
                  {activeFeature.spec}
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs border-t border-[#e2e8f0] pt-3">
                <div className="flex justify-between text-[#555555]">
                  <span>EXECUTION ENGINE:</span>
                  <span className="font-bold text-black">ASTRA-6 / THREE.JS</span>
                </div>
                <div className="flex justify-between text-[#555555]">
                  <span>COMPUTATION:</span>
                  <span className="font-bold text-black">{activeFeature.techStat}</span>
                </div>
                <div className="flex justify-between text-[#555555]">
                  <span>STORAGE:</span>
                  <span className="font-bold text-black">OFFLINE / LOCAL SESSION</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#fff9e6] border border-[#e5a914] text-[11px] font-mono text-[#6b4700]">
              <strong>PLUG &amp; PLAY:</strong> Click &quot;Launch Digital Twin&quot; above to inspect this feature live in the 3D viewport.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
