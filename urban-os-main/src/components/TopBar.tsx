import React, { useState } from 'react';
import { useStore } from '../store';
import { getArea, getStreet } from '../dataHelpers';
import { downloadGeoJSON } from '../utils/exportGeoJSON';
import { exportScenePNG } from '../utils/exportPNG';

export const TopBar: React.FC = () => {
  const {
    cityId,
    areaId,
    streetId,
    setStreet,
    viewMode,
    toggleViewMode,
    exploded,
    toggleExplode,
    backToWizard,
    openPortal,
    logout,
    newHouses,
    newPipeRuns,
    clashes,
    setToast,
    scanInProgress,
    runScan,
    activeSidebarTab,
    setActiveSidebarTab,
  } = useStore();

  const [exportOpen, setExportOpen] = useState(false);
  const currentArea = getArea(cityId, areaId);
  const currentStreet = getStreet(cityId, areaId, streetId);
  const streets = currentArea.streets || [];

  const handleExportPNG = async () => {
    setExportOpen(false);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) {
      setToast('Canvas element not found for export');
      return;
    }
    setToast('Generating 2400×1600 blueprint PNG...');
    await exportScenePNG(canvas, currentStreet.name);
    setToast('PNG Blueprint downloaded');
  };

  const handleExportGeoJSON = () => {
    setExportOpen(false);
    const houses = newHouses[streetId] || [];
    const pipes = newPipeRuns[streetId] || [];
    downloadGeoJSON(currentStreet.name, houses, pipes);
    setToast('GeoJSON exported (WGS84 compatible with geojson.io)');
  };

  return (
    <header className="h-12 bg-white border-b border-black hard-shadow-sm flex items-center justify-between px-3 select-none z-30 relative">
      {/* Left: Logo & Navigation Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="back-to-hub-btn"
          onClick={openPortal}
          className="border border-black bg-white hover:bg-[#f1f1f1] px-2.5 py-1 font-mono text-xs font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          title="Return to the 2-Option Portal Hub"
        >
          ⟵ Hub
        </button>

        <button
          onClick={backToWizard}
          className="border border-black bg-[#f1f1f1] hover:bg-[#e0e0e0] px-2 py-1 font-mono text-xs font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          title="Return to street selection"
        >
          Street
        </button>

        <button
          onClick={() => setActiveSidebarTab(activeSidebarTab === 'directory' ? 'tools' : 'directory')}
          className={`border border-black px-2 py-1 font-mono text-xs font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1 ${
            activeSidebarTab === 'directory'
              ? 'bg-[#00cc66] text-black'
              : 'bg-white text-black hover:bg-[#f1f1f1]'
          }`}
          title="Toggle Statutory Government Directory (Module 02)"
        >
          <span>🏛 Directory</span>
        </button>

        <div className="h-5 w-[1px] bg-black"></div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#dc0000]"></span>
          <span className="font-bold text-xs tracking-wider uppercase font-mono">
            ⬢ BENGALURU DIGITAL TWIN
          </span>
        </div>

        <span className="font-mono text-[10px] bg-[#f0f0f0] border border-[#cccccc] px-1.5 py-0.5 uppercase text-[#444444]">
          {currentArea.name}
        </span>
      </div>

      {/* Center: Street Selector & Clashes Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="text-[#666666] font-bold text-[10px] uppercase">STREET:</span>
          <select
            aria-label="Street Selector"
            value={streetId}
            onChange={(e) => setStreet(e.target.value)}
            className="border border-black bg-white px-2 py-1 font-mono text-xs font-semibold focus:outline-none"
          >
            {streets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {clashes.length > 0 && (
          <div className="bg-[#dc0000] text-white border border-black px-2 py-0.5 font-mono text-[11px] font-bold hard-shadow-sm animate-pulse">
            ⚠ {clashes.length} CLASH{clashes.length > 1 ? 'ES' : ''} DETECTED
          </div>
        )}
      </div>

      {/* Right Controls: Single/Area view, Explode, Export */}
      <div className="flex items-center gap-2">
        {/* Single / Area Toggle */}
        <button
          onClick={toggleViewMode}
          className={`border border-black px-2.5 py-1 font-mono text-xs font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ${
            viewMode === 'area'
              ? 'bg-[#e5a914] text-black'
              : 'bg-white text-black hover:bg-[#f5f5f5]'
          }`}
        >
          {viewMode === 'area' ? '■ Area View (3 Streets)' : '□ Single View'}
        </button>

        {/* Explode Road Toggle */}
        <button
          onClick={toggleExplode}
          className={`border border-black px-2.5 py-1 font-mono text-xs font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5 ${
            exploded
              ? 'bg-[#dc0000] text-white'
              : 'bg-white text-black hover:bg-[#f5f5f5]'
          }`}
        >
          <span>{exploded ? '▼ Collapse Road' : '▲ Explode Road (8m)'}</span>
        </button>

        {/* Scan Button */}
        <button
          onClick={() => runScan()}
          disabled={scanInProgress}
          className={`border border-black px-2.5 py-1 font-mono text-xs font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1 ${
            scanInProgress
              ? 'bg-[#e5e5e5] text-[#888888] cursor-not-allowed shadow-none'
              : 'bg-white text-black hover:bg-[#f5f5f5]'
          }`}
          title="Run 3D utility clash detection"
        >
          <span>{scanInProgress ? 'SCANNING…' : '⟳ SCAN'}</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="border border-black bg-black text-white px-3 py-1 font-mono text-xs font-bold uppercase hard-shadow-sm hover:bg-[#222222] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1"
          >
            <span>Export</span>
            <span className="text-[10px]">▼</span>
          </button>

          {exportOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-black hard-shadow z-50 font-mono text-xs">
              <button
                onClick={handleExportPNG}
                className="w-full text-left px-3 py-2 hover:bg-[#fff9e6] border-b border-[#e0e0e0] font-bold flex flex-col"
              >
                <span>Export CAD PNG</span>
                <span className="text-[10px] text-[#666666] font-normal">
                  2400×1600 · Blueprint + Legend
                </span>
              </button>
              <button
                onClick={handleExportGeoJSON}
                className="w-full text-left px-3 py-2 hover:bg-[#fff9e6] font-bold flex flex-col"
              >
                <span>Export GeoJSON</span>
                <span className="text-[10px] text-[#666666] font-normal">
                  WGS84 Coordinates · GIS Layers
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Exit App Button */}
        <button
          onClick={logout}
          className="border border-[#dc0000] text-[#dc0000] bg-white hover:bg-[#dc0000] hover:text-white px-2.5 py-1 font-mono text-xs font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          title="Exit App and Sign Out"
        >
          Exit
        </button>
      </div>
    </header>
  );
};
