import React, { useState } from 'react';
import { useStore } from '../store';
import { getArea, getStreet } from '../dataHelpers';
import { downloadGeoJSON } from '../utils/exportGeoJSON';
import { exportScenePNG } from '../utils/exportPNG';
import { exportLayoutToGLB } from '../utils/layoutExport';

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
    layoutMode,
    setLayoutMode,
    layoutItems,
  } = useStore();

  const [exportOpen, setExportOpen] = useState(false);
  const currentArea = getArea(cityId, areaId);
  const currentStreet = getStreet(cityId, areaId, streetId);
  const streets = currentArea.streets || [];

  const handleExportPNG = async () => {
    setExportOpen(false);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return setToast('Canvas element not found for export');
    setToast('Generating 2400×1600 blueprint PNG...');
    await exportScenePNG(canvas, currentStreet.name);
    setToast('PNG Blueprint downloaded');
  };

  const handleExportGeoJSON = () => {
    setExportOpen(false);
    downloadGeoJSON(currentStreet.name, newHouses[streetId] || [], newPipeRuns[streetId] || []);
    setToast('GeoJSON exported (WGS84 compatible with geojson.io)');
  };

  const handleExportGLB = async () => {
    if (layoutItems.length === 0) {
      return setToast('No layout items to export. Place House, Park, Road, or Water Pipe first.');
    }
    setToast('Generating 3D binary .GLB file with GLTFExporter...');
    try {
      const ok = await exportLayoutToGLB(`custom-layout-${currentStreet.id}.glb`);
      setToast(ok ? 'GLB file downloaded automatically' : 'No 3D objects found to export');
    } catch {
      setToast('GLB export failed. Check browser console.');
    }
  };

  return (
    <header className="h-12 bg-white border-b border-black hard-shadow-sm flex items-center justify-between px-3 select-none z-30 relative font-mono text-xs">
      {/* Left: Navigation and Hub */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="back-to-hub-btn"
          onClick={openPortal}
          className="border border-black bg-white hover:bg-[#f1f1f1] px-2.5 py-1 font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        >
          ⟵ Hub
        </button>
        {layoutMode !== 'create' && (
          <>
            <button
              onClick={backToWizard}
              className="border border-black bg-[#f1f1f1] hover:bg-[#e0e0e0] px-2 py-1 font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              Street
            </button>
            <button
              onClick={() => setActiveSidebarTab(activeSidebarTab === 'directory' ? 'tools' : 'directory')}
              className={`border border-black px-2 py-1 font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1 ${
                activeSidebarTab === 'directory' ? 'bg-[#00cc66] text-black' : 'bg-white text-black hover:bg-[#f1f1f1]'
              }`}
            >
              🏛 Directory
            </button>
          </>
        )}
        <div className="h-5 w-[1px] bg-black"></div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#dc0000]"></span>
          <span className="font-bold text-xs tracking-wider uppercase">⬢ BENGALURU DIGITAL TWIN</span>
        </div>
        {layoutMode === 'create' ? (
          <span className="font-mono text-[10px] bg-[#00ff66] text-black border border-black px-1.5 py-0.5 uppercase font-bold">
            🏗️ CREATE LAYOUT MODE
          </span>
        ) : (
          <span className="font-mono text-[10px] bg-[#f0f0f0] border border-[#cccccc] px-1.5 py-0.5 uppercase text-[#444444]">
            {currentArea.name}
          </span>
        )}
      </div>

      {/* Center: Street selector or Create mode status */}
      <div className="flex items-center gap-3">
        {layoutMode === 'create' ? (
          <div className="border border-black bg-[#fff9e6] px-2.5 py-0.5 text-[11px] font-bold text-[#6b4700]">
            GRID Y=0 · {layoutItems.length} OBJECT{layoutItems.length !== 1 ? 'S' : ''} PLACED
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <span className="text-[#666666] font-bold text-[10px] uppercase">STREET:</span>
              <select
                aria-label="Street Selector"
                value={streetId}
                onChange={(e) => setStreet(e.target.value)}
                className="border border-black bg-white px-2 py-1 font-semibold focus:outline-none"
              >
                {streets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {clashes.length > 0 && (
              <div className="bg-[#dc0000] text-white border border-black px-2 py-0.5 text-[11px] font-bold hard-shadow-sm animate-pulse">
                ⚠ {clashes.length} CLASH{clashes.length > 1 ? 'ES' : ''}
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {layoutMode === 'create' ? (
          <>
            {/* SAVE LAYOUT Button */}
            <button
              onClick={() => {
                setLayoutMode('explore');
                setToast(`Layout saved (${layoutItems.length} items)! Visible in 3D scene.`);
              }}
              className="border border-black bg-[#00cc66] hover:bg-[#00bb55] text-black px-3 py-1 font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              💾 SAVE LAYOUT
            </button>

            {/* EXPORT LAYOUT Button */}
            <button
              onClick={handleExportGLB}
              className="border border-black bg-black text-white hover:bg-[#222222] px-3 py-1 font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              📦 EXPORT LAYOUT
            </button>
          </>
        ) : (
          <>
            {/* [ 🏗️ Create Layout ] Button */}
            <button
              onClick={() => setLayoutMode('create')}
              className="border border-black bg-[#fef08a] hover:bg-[#fde047] text-black px-2.5 py-1 font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              [ 🏗️ Create Layout ]
            </button>

            <button
              onClick={toggleViewMode}
              className={`border border-black px-2.5 py-1 font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ${
                viewMode === 'area' ? 'bg-[#e5a914] text-black' : 'bg-white text-black hover:bg-[#f5f5f5]'
              }`}
            >
              {viewMode === 'area' ? '■ Area' : '□ Single'}
            </button>

            <button
              onClick={toggleExplode}
              className={`border border-black px-2.5 py-1 font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ${
                exploded ? 'bg-[#dc0000] text-white' : 'bg-white text-black hover:bg-[#f5f5f5]'
              }`}
            >
              {exploded ? '▼ Collapse' : '▲ Explode'}
            </button>

            <button
              onClick={() => runScan()}
              disabled={scanInProgress}
              className="border border-black px-2 py-1 font-bold uppercase hard-shadow-sm bg-white text-black hover:bg-[#f5f5f5] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              {scanInProgress ? 'SCANNING…' : '⟳ SCAN'}
            </button>

            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="border border-black bg-black text-white px-2.5 py-1 font-bold uppercase hard-shadow-sm hover:bg-[#222] cursor-pointer flex items-center gap-1"
              >
                <span>Export</span>
                <span className="text-[10px]">▼</span>
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-black hard-shadow z-50">
                  <button
                    onClick={handleExportPNG}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#fff9e6] border-b border-[#e0e0e0] font-bold block"
                  >
                    CAD PNG Blueprint
                  </button>
                  <button
                    onClick={handleExportGeoJSON}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#fff9e6] font-bold block"
                  >
                    GIS GeoJSON
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <button
          onClick={logout}
          className="border border-[#dc0000] text-[#dc0000] bg-white hover:bg-[#dc0000] hover:text-white px-2 py-1 font-bold uppercase hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        >
          Exit
        </button>
      </div>
    </header>
  );
};
