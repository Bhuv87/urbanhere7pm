import React from 'react';
import { useStore } from '../../store';

export const LegendPanel: React.FC = () => {
  const {
    streetId,
    newHouses,
    newPipeRuns,
    selectedObjectId,
    removeHouse,
    removePipeRun,
    setSelectedObjectId,
    setToast,
  } = useStore();

  const currentHouses = newHouses[streetId] || [];
  const currentPipes = newPipeRuns[streetId] || [];

  const handleDeleteSelected = () => {
    if (!selectedObjectId) return;
    if (selectedObjectId.startsWith('house-')) {
      removeHouse(streetId, selectedObjectId);
    } else if (selectedObjectId.startsWith('pipe-')) {
      removePipeRun(streetId, selectedObjectId);
    }
    setSelectedObjectId(null);
  };

  return (
    <div className="border border-black p-2.5 bg-white hard-shadow-sm mb-3">
      <div className="font-mono text-[11px] font-bold tracking-widest uppercase text-black pb-1.5 border-b border-black mb-2 flex items-center justify-between">
        <span>04 // GIS MAP LEGEND</span>
        <span className="text-[10px] text-[#666666]">UTILITY CODES</span>
      </div>

      {/* Utility Color Codes */}
      <div className="space-y-1.5 font-mono text-[10px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#00aaff] border border-black inline-block"></span>
            <span className="font-semibold">WATER (BWSSB)</span>
          </div>
          <span className="text-[#666666]">-2.5m · Ø0.6m</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#ff8800] border border-black inline-block"></span>
            <span className="font-semibold">GAS (GAIL)</span>
          </div>
          <span className="text-[#666666]">-1.8m · Ø0.4m</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#ff00aa] border border-black inline-block"></span>
            <span className="font-semibold">FIBER (TELECOM)</span>
          </div>
          <span className="text-[#666666]">-1.0m · Ø0.2m</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#ff3300] border border-black inline-block"></span>
            <span className="font-semibold">POWER (BESCOM 11kV)</span>
          </div>
          <span className="text-[#666666]">-1.4m · Ø0.35m</span>
        </div>
      </div>

      {/* Active Placed Stats */}
      <div className="mt-3 pt-2 border-t border-[#e0e0e0] font-mono text-[10px]">
        <div className="flex justify-between py-0.5 text-[#555555]">
          <span>PLACED HOUSES:</span>
          <span className="font-bold text-black">{currentHouses.length}</span>
        </div>
        <div className="flex justify-between py-0.5 text-[#555555]">
          <span>NEW PIPE RUNS:</span>
          <span className="font-bold text-black">{currentPipes.length}</span>
        </div>
      </div>

      {/* Selected Object Action */}
      {selectedObjectId && (
        <div className="mt-2 p-1.5 bg-[#fff3f3] border border-[#dc0000] font-mono text-[10px]">
          <div className="flex items-center justify-between text-[#dc0000] font-bold mb-1">
            <span>SELECTED OBJECT:</span>
            <span>{selectedObjectId.slice(0, 12)}...</span>
          </div>
          <button
            onClick={handleDeleteSelected}
            className="w-full bg-[#dc0000] text-white border border-black py-1 font-bold uppercase hover:bg-[#b00000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            Delete Selected [Del]
          </button>
        </div>
      )}
    </div>
  );
};
