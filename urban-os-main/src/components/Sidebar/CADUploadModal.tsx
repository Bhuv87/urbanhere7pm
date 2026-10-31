import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { loadCADFile } from '../../utils/cadLoader';
import { HouseModelVariant } from '../../data/houseModels';
import { evaluateZoningCompliance } from '../../utils/zoning';
import { getStreet } from '../../dataHelpers';

export const CADUploadModal: React.FC = () => {
  const {
    cadGuideOpen,
    setCADGuideOpen,
    addCustomHouseModel,
    setCADModel,
    setZoningReport,
    setToast,
    cityId,
    areaId,
    streetId,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [modelName, setModelName] = useState('');
  const [targetCategory, setTargetCategory] = useState<'20x30' | '30x40' | '40x60' | 'custom'>('20x30');
  const [useCase, setUseCase] = useState<'house' | 'tower'>('house');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!cadGuideOpen) return null;

  const handleProcessFile = async (file: File) => {
    setLoading(true);
    setErrorMsg(null);
    setToast(`Processing CAD file: ${file.name}...`);

    try {
      const parsed = await loadCADFile(file);
      const name = modelName.trim() || file.name.replace(/\.[^/.]+$/, '');

      if (useCase === 'house') {
        const cat = targetCategory === 'custom' ? parsed.detectedCategory : targetCategory;
        let footprint: [number, number] = [6.1, 9.1];
        let sqft = 600;
        let fl = 2;

        if (cat === '30x40') {
          footprint = [9.1, 12.2];
          sqft = 1200;
          fl = 3;
        } else if (cat === '40x60') {
          footprint = [12.2, 18.3];
          sqft = 2400;
          fl = 4;
        } else {
          // Custom / auto-dimensions
          footprint = [parsed.dimensions.width || 6.1, parsed.dimensions.depth || 9.1];
          sqft = Math.round(footprint[0] * footprint[1] * 10.764);
          fl = Math.max(1, Math.round(parsed.dimensions.height / 3.0));
        }

        const newVariant: HouseModelVariant = {
          id: `custom-${Date.now()}`,
          category: cat,
          name: name,
          subtitle: `Custom CAD Model (${parsed.format.toUpperCase()})`,
          sqft,
          floors: fl,
          footprint,
          height: parsed.dimensions.height || fl * 3.0,
          style: 'custom-cad',
          description: `User-imported 3D CAD model (${file.name}) with verified BIM geometry.`,
          features: ['Custom 3D CAD Mesh', `${parsed.format.toUpperCase()} Standard`, 'Plot Aligned'],
          isCustom: true,
          meshPositions: parsed.meshPositions,
          meshNormals: parsed.meshNormals,
          meshIndices: parsed.meshIndices,
        };

        addCustomHouseModel(newVariant);
        setToast(`Added "${name}" to ${cat} house catalog! Click on plot to place.`);
        setCADGuideOpen(false);
      } else {
        // Commercial tower / Street landmark zoning check
        const street = getStreet(cityId, areaId, streetId);
        const center = street.emptyPlotCenter || [20, 0, -18];
        const bbox = {
          min: [center[0] - parsed.dimensions.width / 2, 0, center[2] - parsed.dimensions.depth / 2] as [number, number, number],
          max: [center[0] + parsed.dimensions.width / 2, parsed.dimensions.height, center[2] + parsed.dimensions.depth / 2] as [number, number, number],
        };
        const currentHeightLimit = useStore.getState().zoningHeightLimit;
        const report = evaluateZoningCompliance(bbox, center, 24, 20, currentHeightLimit);

        setCADModel({
          filename: file.name,
          bbox,
          loading: false,
        });
        setZoningReport(report);
        setToast(`Loaded CAD model: ${file.name} · Zoning: ${report.allPass ? 'PASS' : 'FAIL'}`);
        setCADGuideOpen(false);
      }
    } catch (err: any) {
      console.error('CAD upload processing error:', err);
      setErrorMsg(`Failed to parse: ${err?.message || 'Unsupported format or corrupted file'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-2xl bg-white border-2 border-black hard-shadow p-5 text-black max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#dc0000]"></span>
            <span className="font-mono text-sm font-bold uppercase tracking-wider">
              CAD MODEL IMPORT & HOW-TO GUIDE
            </span>
          </div>
          <button
            onClick={() => setCADGuideOpen(false)}
            className="border border-black px-2 py-0.5 font-mono text-xs font-bold hover:bg-[#f0f0f0] cursor-pointer"
          >
            ✕ CLOSE [ESC]
          </button>
        </div>

        {/* Step-by-Step Export Guide */}
        <div className="bg-[#f8f8f8] border border-black p-3 mb-4 font-mono text-xs">
          <div className="font-bold text-[#333333] uppercase mb-1.5 flex items-center gap-1.5">
            <span>ℹ</span> HOW TO EXPORT YOUR 3D CAD MODEL FOR BENGALURU DIGITAL TWIN:
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#444444]">
            <div className="bg-white p-2 border border-[#d0d0d0]">
              <strong className="text-black block mb-0.5">AutoCAD / Revit / FreeCAD:</strong>
              Export via <code className="bg-[#eee] px-1">File &gt; Export &gt; STEP (.step / .stp)</code> or <code className="bg-[#eee] px-1">.STL / .OBJ</code>.
            </div>
            <div className="bg-white p-2 border border-[#d0d0d0]">
              <strong className="text-black block mb-0.5">Fusion 360 / SolidWorks:</strong>
              Export as <code className="bg-[#eee] px-1">STEP AP214/AP203 (.step)</code> or <code className="bg-[#eee] px-1">STL (.stl)</code>.
            </div>
            <div className="bg-white p-2 border border-[#d0d0d0]">
              <strong className="text-black block mb-0.5">SketchUp / Blender / Rhino:</strong>
              Export as <code className="bg-[#eee] px-1">Wavefront OBJ (.obj)</code> or <code className="bg-[#eee] px-1">glTF / GLB (.glb)</code>.
            </div>
            <div className="bg-white p-2 border border-[#d0d0d0]">
              <strong className="text-black block mb-0.5">Supported Formats:</strong>
              <span className="text-[#008800] font-bold">.STEP, .STP, .STL, .OBJ, .GLTF, .GLB</span> (Auto-scaled from mm/m).
            </div>
          </div>
        </div>

        {/* Upload Configuration */}
        <div className="space-y-3 font-mono text-xs mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">
                Target Placement Type:
              </label>
              <select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value as any)}
                className="w-full border border-black bg-white p-1.5 text-xs focus:outline-none"
              >
                <option value="house">Placeable House Model (in Catalog)</option>
                <option value="tower">Commercial Landmark Tower (Zoning Audit)</option>
              </select>
            </div>

            {useCase === 'house' && (
              <div>
                <label className="block text-[11px] font-bold uppercase mb-1">
                  Assign To Plot Category:
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value as any)}
                  className="w-full border border-black bg-white p-1.5 text-xs focus:outline-none"
                >
                  <option value="20x30">20×30 FT (600 SQFT Plot)</option>
                  <option value="30x40">30×40 FT (1200 SQFT Plot)</option>
                  <option value="40x60">40×60 FT (2400 SQFT Plot)</option>
                  <option value="custom">Auto-detect from CAD Dimensions</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase mb-1">
              Custom Model Name (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. My 20x30 Duplex Villa Model"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full border border-black bg-white p-1.5 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".step,.stp,.STEP,.STP,.stl,.STL,.obj,.OBJ,.gltf,.glb"
          className="hidden"
        />

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-black p-6 text-center cursor-pointer hover:bg-[#fff9e6] transition-none hard-shadow-sm mb-4"
        >
          <div className="font-mono text-sm font-bold uppercase text-black">
            {loading ? 'PARSING CAD GEOMETRY...' : '📁 DRAG & DROP YOUR CAD MODEL HERE OR CLICK TO BROWSE'}
          </div>
          <div className="font-mono text-[11px] text-[#666666] mt-1">
            Accepts: .STEP · .STP · .STL · .OBJ · .GLTF · .GLB (any file size)
          </div>
        </div>

        {errorMsg && (
          <div className="p-2 bg-[#fff3f3] border border-[#dc0000] text-[#dc0000] font-mono text-xs mb-3">
            ⚠ {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e0e0e0] font-mono text-xs">
          <span className="text-[#666666]">
            WASM Accelerated · Zero External Upload · 100% Private In-Browser
          </span>
          <button
            onClick={() => setCADGuideOpen(false)}
            className="border border-black bg-[#f0f0f0] hover:bg-[#e0e0e0] px-4 py-1.5 font-bold uppercase cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
