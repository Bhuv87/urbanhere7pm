import React, { useRef, useState } from 'react';
import { useStore } from '../../store';
import { evaluateZoningCompliance } from '../../utils/zoning';
import { getStreet } from '../../dataHelpers';
import { loadCADFile } from '../../utils/cadLoader';

export const CADUploader: React.FC = () => {
  const {
    cityId,
    areaId,
    streetId,
    cadModel,
    setCADModel,
    setZoningReport,
    clearCAD,
    setCADGuideOpen,
    setToast,
    zoningHeightLimit,
    setZoningHeightLimit,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setLoading(true);
    setToast(`Parsing CAD file: ${file.name}...`);

    try {
      const parsed = await loadCADFile(file);

      const street = getStreet(cityId, areaId, streetId);
      const center = street.emptyPlotCenter || [20, 0, -18];

      const width = parsed.dimensions.width || 22.0;
      const height = parsed.dimensions.height || 45.0;
      const depth = parsed.dimensions.depth || 16.0;

      // Bounding box at plot center
      const bbox = {
        min: [center[0] - width / 2, 0, center[2] - depth / 2] as [number, number, number],
        max: [center[0] + width / 2, height, center[2] + depth / 2] as [number, number, number],
      };

      // Evaluate municipal zoning with current height limit
      const currentHeightLimit = useStore.getState().zoningHeightLimit;
      const report = evaluateZoningCompliance(bbox, center, 24, 20, currentHeightLimit);

      setCADModel({
        filename: file.name,
        bbox,
        meshData: parsed.meshPositions
          ? {
              positions: parsed.meshPositions,
              normals: parsed.meshNormals,
              indices: parsed.meshIndices,
            }
          : undefined,
        loading: false,
      });

      setZoningReport(report);
      setToast(`Loaded CAD model: ${file.name} (${parsed.format.toUpperCase()}) · Zoning: ${report.allPass ? 'PASS' : 'FAIL'}`);
    } catch (err: any) {
      console.error('CAD parse error:', err);
      setToast('Failed to parse CAD file. See Guide for export tips.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleLoadSample = () => {
    const street = getStreet(cityId, areaId, streetId);
    const center = street.emptyPlotCenter || [20, 0, -18];
    const width = 22.0;
    const height = 45.0;
    const depth = 16.0;

    const bbox = {
      min: [center[0] - width / 2, 0, center[2] - depth / 2] as [number, number, number],
      max: [center[0] + width / 2, height, center[2] + depth / 2] as [number, number, number],
    };

    const currentHeightLimit = useStore.getState().zoningHeightLimit;
    const report = evaluateZoningCompliance(bbox, center, 24, 20, currentHeightLimit);
    setCADModel({
      filename: 'bengaluru_tech_tower_45m.step',
      bbox,
      loading: false,
    });
    setZoningReport(report);
    setToast(`Loaded sample Commercial Tower (45m) · Zoning: ${report.allPass ? 'PASS' : `FAIL (vs ${currentHeightLimit}m limit)`}`);
  };

  return (
    <div className="border border-black p-2.5 bg-white hard-shadow-sm mb-3">
      <div className="font-mono text-[11px] font-bold tracking-widest uppercase text-black pb-1.5 border-b border-black mb-2 flex items-center justify-between">
        <span>05 // CAD &amp; ZONING AUDIT</span>
        <span className="text-[10px] text-[#666666]">STEP · STL · OBJ</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".step,.stp,.STEP,.STP,.stl,.STL,.obj,.OBJ,.gltf,.glb"
        className="hidden"
      />

      {cadModel ? (
        <div className="space-y-2 font-mono text-[11px]">
          <div className="p-2 bg-[#f0f0f0] border border-black">
            <div className="flex justify-between items-center text-black font-bold">
              <span className="truncate max-w-[170px]">{cadModel.filename}</span>
              <span className="text-[9px] bg-black text-white px-1">ACTIVE</span>
            </div>
            <div className="text-[10px] text-[#555555] mt-1">
              Height: {(cadModel.bbox.max[1] - cadModel.bbox.min[1]).toFixed(1)}m · Footprint:{' '}
              {(cadModel.bbox.max[0] - cadModel.bbox.min[0]).toFixed(0)}×
              {(cadModel.bbox.max[2] - cadModel.bbox.min[2]).toFixed(0)}m
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border border-black bg-white hover:bg-[#fafafa] py-1 font-bold text-[10px] uppercase cursor-pointer"
            >
              Replace CAD
            </button>
            <button
              onClick={clearCAD}
              className="border border-black bg-white hover:bg-[#fff0f0] text-[#dc0000] py-1 font-bold text-[10px] uppercase cursor-pointer"
            >
              Remove
            </button>
          </div>

          {/* Fix & Convert to Permanent House */}
          <button
            onClick={() => useStore.getState().convertCADToPermanentHouse()}
            className="w-full border-2 border-black bg-[#dc0000] hover:bg-[#b91c1c] text-white py-1.5 font-mono text-[10px] font-bold uppercase cursor-pointer hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px]"
          >
            📌 FIX &amp; PLACE AS HOUSE ON PLOT
          </button>

          {/* Toggle Appearance: Normal Realistic vs Blueprint */}
          <button
            onClick={() => useStore.getState().toggleCADRenderMode()}
            className="w-full border border-black bg-[#f0f0f0] hover:bg-[#e4e4e4] py-1 font-mono text-[10px] font-bold uppercase text-black cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>APPEARANCE:</span>
            <span className={useStore.getState().cadRenderMode === 'normal' ? 'text-[#15803d]' : 'text-[#0284c7]'}>
              {useStore.getState().cadRenderMode === 'normal' ? '🏛️ NORMAL REALISTIC' : '📐 CAD BLUEPRINT'}
            </span>
          </button>
        </div>
      ) : (
        <div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-black p-3 text-center cursor-pointer hover:bg-[#fff9e6] transition-none mb-2"
          >
            <div className="font-mono text-xs font-bold uppercase">
              {loading ? 'PARSING CAD FILE...' : 'DRAG CAD FILE OR CLICK'}
            </div>
            <div className="text-[10px] font-mono text-[#666666] mt-0.5">
              .STEP · .STP · .STL · .OBJ · .GLTF
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleLoadSample}
              className="border border-black bg-[#f0f0f0] hover:bg-[#e4e4e4] py-1 font-mono text-[10px] font-bold uppercase cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              Load Sample STEP
            </button>
            <button
              onClick={() => setCADGuideOpen(true)}
              className="border border-black bg-black text-white hover:bg-[#222222] py-1 font-mono text-[10px] font-bold uppercase cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              Upload Guide ℹ
            </button>
          </div>
        </div>
      )}

      {/* Manual Height Limit Adjuster */}
      <div className="mt-3 pt-2.5 border-t border-black space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-bold uppercase tracking-wider text-black">
            MUNICIPAL HEIGHT CEILING:
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="5"
              max="150"
              step="0.5"
              value={zoningHeightLimit}
              onChange={(e) => setZoningHeightLimit(Math.max(5, Number(e.target.value) || 30))}
              className="w-12 border border-black px-1 py-0.5 text-right font-mono font-bold bg-white text-[10px]"
            />
            <span className="font-bold text-[10px]">m</span>
          </div>
        </div>

        <input
          type="range"
          min="5"
          max="120"
          step="0.5"
          value={zoningHeightLimit}
          onChange={(e) => setZoningHeightLimit(Number(e.target.value))}
          className="w-full accent-black cursor-pointer h-1.5"
        />

        <div className="grid grid-cols-3 gap-1 pt-0.5">
          {[
            { label: '11.5m G+2', val: 11.5 },
            { label: '15m G+3', val: 15.0 },
            { label: '24m G+7', val: 24.0 },
            { label: '30m Std', val: 30.0 },
            { label: '45m Tower', val: 45.0 },
            { label: '60m High', val: 60.0 },
          ].map((preset) => (
            <button
              key={preset.val}
              onClick={() => setZoningHeightLimit(preset.val)}
              className={`py-0.5 text-[9px] font-bold border border-black cursor-pointer truncate ${
                zoningHeightLimit === preset.val
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-[#e2e8f0]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
