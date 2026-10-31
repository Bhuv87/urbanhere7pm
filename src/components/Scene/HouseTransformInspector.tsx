import React from 'react';
import { useStore } from '../../store';
import { HouseModelVariant } from '../../data/houseModels';

export const HouseTransformInspector: React.FC = () => {
  const {
    selectedObjectId,
    setSelectedObjectId,
    streetId,
    newHouses,
    updateHouseTransform,
    removeHouse,
    duplicateHouse,
    houseModels,
    zoningHeightLimit,
  } = useStore();

  if (!selectedObjectId || !selectedObjectId.startsWith('house-')) {
    return null;
  }

  const currentHouses = newHouses[streetId] || [];
  const house = currentHouses.find((h) => h.id === selectedObjectId);
  if (!house) return null;

  // Resolve model details
  const model: HouseModelVariant =
    (house.modelId && houseModels.find((m) => m.id === house.modelId)) ||
    houseModels.find((m) => m.category === house.type) ||
    houseModels[0];

  const rot3D = house.rotation3D || [0, Math.round(((house.rotation || 0) * 180) / Math.PI), 0];
  const rotX = Math.round(rot3D[0] || 0);
  const rotY = Math.round(rot3D[1] || 0);
  const rotZ = Math.round(rot3D[2] || 0);

  const effectiveHeight = house.customHeight || model.height;
  const isHeightViolation = effectiveHeight > zoningHeightLimit;
  const headroom = (zoningHeightLimit - effectiveHeight).toFixed(1);

  const handleRotate = (axisIndex: 0 | 1 | 2, value: number) => {
    const next: [number, number, number] = [rot3D[0] || 0, rot3D[1] || 0, rot3D[2] || 0];
    next[axisIndex] = value;
    updateHouseTransform(streetId, house.id, { rotation3D: next });
  };

  const handleStepRotate = (axisIndex: 0 | 1 | 2, delta: number) => {
    const current = rot3D[axisIndex] || 0;
    const nextVal = (current + delta + 360) % 360;
    handleRotate(axisIndex, nextVal);
  };

  const handleNudge = (dx: number, dz: number) => {
    const newPlot: [number, number] = [house.plot[0] + dx, house.plot[1] + dz];
    updateHouseTransform(streetId, house.id, { plot: newPlot });
  };

  const handleResetRot = () => {
    updateHouseTransform(streetId, house.id, { rotation3D: [0, 0, 0] });
  };

  return (
    <div className="absolute bottom-4 right-4 w-96 bg-white border-2 border-black font-mono text-xs hard-shadow z-30 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black text-white border-b border-black">
        <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-[#dc0000] font-bold">📐</span>
          <span className="font-bold tracking-wider uppercase text-[11px] truncate">
            HOUSE TRANSFORM & 3D ROTATION
          </span>
        </div>
        <button
          onClick={() => setSelectedObjectId(null)}
          className="text-white hover:text-[#dc0000] font-bold text-xs px-1 cursor-pointer"
          title="Deselect House (ESC)"
        >
          ✕
        </button>
      </div>

      <div className="p-3 space-y-3 bg-white">
        {/* Model Info Header */}
        <div className="border border-black p-2 bg-[#f8fafc]">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-black text-xs">{model.name}</div>
              <div className="text-[10px] text-[#555555]">{model.subtitle} · {house.type} FT</div>
            </div>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-bold text-white uppercase ${
                isHeightViolation ? 'bg-[#dc0000]' : 'bg-[#00aa44]'
              }`}
            >
              {isHeightViolation ? 'HEIGHT VIOLATION' : 'ZONING COMPLIANT'}
            </span>
          </div>

          <div className="mt-1 pt-1 border-t border-[#e2e8f0] flex justify-between text-[10px]">
            <span className="text-[#555555]">Height vs Limit:</span>
            <span className="font-bold">
              {effectiveHeight}m / {zoningHeightLimit}m{' '}
              <span className={isHeightViolation ? 'text-[#dc0000]' : 'text-[#00aa44]'}>
                ({isHeightViolation ? `+${Math.abs(Number(headroom))}m Over` : `${headroom}m Headroom`})
              </span>
            </span>
          </div>
        </div>

        {/* 3-AXIS ROTATION CONTROLS */}
        <div className="border border-black p-2 space-y-2.5">
          <div className="flex justify-between items-center pb-1 border-b border-[#e2e8f0]">
            <span className="font-bold uppercase tracking-wider text-[10px] text-black">
              3-AXIS DEGREE ROTATION
            </span>
            <button
              onClick={handleResetRot}
              className="text-[9px] bg-white border border-black px-1.5 py-0.5 hover:bg-black hover:text-white cursor-pointer"
            >
              RESET [0,0,0]
            </button>
          </div>

          {/* 1. YAW (Y AXIS - HEADING / COMPASS) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-[#0284c7]">YAW (Y AXIS) · HEADING:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={rotY}
                  onChange={(e) => handleRotate(1, Number(e.target.value) || 0)}
                  className="w-12 border border-black px-1 py-0.5 text-right font-mono font-bold bg-white text-[10px]"
                />
                <span className="text-[#555555]">°</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={rotY}
              onChange={(e) => handleRotate(1, Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-1.5"
            />
            <div className="flex gap-1 justify-between pt-0.5">
              {[
                { label: '0° N', val: 0 },
                { label: '90° E', val: 90 },
                { label: '180° S', val: 180 },
                { label: '270° W', val: 270 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => handleRotate(1, btn.val)}
                  className={`flex-1 py-0.5 text-[9px] font-bold border border-black cursor-pointer ${
                    rotY === btn.val ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#f1f5f9]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
              <button
                onClick={() => handleStepRotate(1, -15)}
                className="px-1 py-0.5 text-[9px] font-bold border border-black bg-white hover:bg-black hover:text-white cursor-pointer"
                title="-15 degrees"
              >
                -15°
              </button>
              <button
                onClick={() => handleStepRotate(1, 15)}
                className="px-1 py-0.5 text-[9px] font-bold border border-black bg-white hover:bg-black hover:text-white cursor-pointer"
                title="+15 degrees"
              >
                +15°
              </button>
            </div>
          </div>

          {/* 2. PITCH (X AXIS - SLOPE / TILT) */}
          <div className="space-y-1 pt-1 border-t border-[#f1f5f9]">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-[#ea580c]">PITCH (X AXIS) · SLOPE:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="-180"
                  max="180"
                  value={rotX}
                  onChange={(e) => handleRotate(0, Number(e.target.value) || 0)}
                  className="w-12 border border-black px-1 py-0.5 text-right font-mono font-bold bg-white text-[10px]"
                />
                <span className="text-[#555555]">°</span>
              </div>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              step="1"
              value={rotX}
              onChange={(e) => handleRotate(0, Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-1.5"
            />
            <div className="flex gap-1 justify-between pt-0.5">
              {[-15, -5, 0, 5, 15].map((val) => (
                <button
                  key={val}
                  onClick={() => handleRotate(0, val)}
                  className={`flex-1 py-0.5 text-[9px] font-bold border border-black cursor-pointer ${
                    rotX === val ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#f1f5f9]'
                  }`}
                >
                  {val === 0 ? 'LEVEL 0°' : `${val > 0 ? '+' : ''}${val}°`}
                </button>
              ))}
            </div>
          </div>

          {/* 3. ROLL (Z AXIS - BANK / CANT) */}
          <div className="space-y-1 pt-1 border-t border-[#f1f5f9]">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-[#16a34a]">ROLL (Z AXIS) · CANT:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="-180"
                  max="180"
                  value={rotZ}
                  onChange={(e) => handleRotate(2, Number(e.target.value) || 0)}
                  className="w-12 border border-black px-1 py-0.5 text-right font-mono font-bold bg-white text-[10px]"
                />
                <span className="text-[#555555]">°</span>
              </div>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              step="1"
              value={rotZ}
              onChange={(e) => handleRotate(2, Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-1.5"
            />
            <div className="flex gap-1 justify-between pt-0.5">
              {[-15, -5, 0, 5, 15].map((val) => (
                <button
                  key={val}
                  onClick={() => handleRotate(2, val)}
                  className={`flex-1 py-0.5 text-[9px] font-bold border border-black cursor-pointer ${
                    rotZ === val ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#f1f5f9]'
                  }`}
                >
                  {val === 0 ? 'LEVEL 0°' : `${val > 0 ? '+' : ''}${val}°`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* POSITION NUDGE & ACTIONS */}
        <div className="border border-black p-2 space-y-2">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold uppercase text-[#555555]">NUDGE PLOT POSITION:</span>
            <span className="font-mono font-bold">
              ({house.plot[0].toFixed(1)}, {house.plot[1].toFixed(1)})
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => handleNudge(-1, 0)}
              className="py-1 text-[10px] font-bold border border-black bg-white hover:bg-black hover:text-white cursor-pointer text-center"
            >
              ← -1m X
            </button>
            <button
              onClick={() => handleNudge(1, 0)}
              className="py-1 text-[10px] font-bold border border-black bg-white hover:bg-black hover:text-white cursor-pointer text-center"
            >
              +1m X →
            </button>
            <button
              onClick={() => handleNudge(0, -1)}
              className="py-1 text-[10px] font-bold border border-black bg-white hover:bg-black hover:text-white cursor-pointer text-center"
            >
              ↑ -1m Z
            </button>
            <button
              onClick={() => handleNudge(0, 1)}
              className="py-1 text-[10px] font-bold border border-black bg-white hover:bg-black hover:text-white cursor-pointer text-center"
            >
              +1m Z ↓
            </button>
          </div>

          <div className="flex gap-1 pt-1">
            <button
              onClick={() => duplicateHouse(streetId, house.id)}
              className="flex-1 py-1 text-[10px] font-bold uppercase border border-black bg-white hover:bg-[#f1f5f9] cursor-pointer"
            >
              + DUPLICATE
            </button>
            <button
              onClick={() => removeHouse(streetId, house.id)}
              className="flex-1 py-1 text-[10px] font-bold uppercase border border-[#dc0000] text-[#dc0000] hover:bg-[#dc0000] hover:text-white cursor-pointer"
            >
              DELETE [DEL]
            </button>
          </div>
        </div>

        {/* Hotkey Guide */}
        <div className="text-[9px] text-[#666666] leading-tight border-t border-[#e2e8f0] pt-1.5">
          <span className="font-bold">SHORTCUTS:</span> Press <code className="bg-[#f1f5f9] px-1 py-0.5 border border-[#cbd5e1]">R</code> to rotate Y heading, <code className="bg-[#f1f5f9] px-1 py-0.5 border border-[#cbd5e1]">DEL</code> to delete, <code className="bg-[#f1f5f9] px-1 py-0.5 border border-[#cbd5e1]">ESC</code> to deselect.
        </div>
      </div>
    </div>
  );
};
