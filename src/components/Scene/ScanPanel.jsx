import React from 'react';
import { useStore } from '../../store';

export const ScanPanel = () => {
  const { scanResults, scanInProgress, rerouteInProgress, autoFixAll, clearScan } = useStore();

  if (scanResults === null) return null;

  const count = scanResults.length;
  const displayList = scanResults.slice(0, 6);
  const remaining = count - displayList.length;

  return (
    <div className="absolute top-4 right-4 z-30 bg-white border border-black shadow-[3px_3px_0_0_#000] p-[14px] w-full max-w-[320px] select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-black">
        <span className="font-bold text-[11px] uppercase tracking-wider text-black">
          SCAN RESULTS
        </span>
        <span className="text-[10px] text-[#666666] font-bold">
          {scanInProgress ? 'SCANNING…' : '3D BIM'}
        </span>
      </div>

      {/* Clash Counter */}
      <div className="py-2 flex items-center justify-between font-bold text-xs uppercase">
        {count > 0 ? (
          <span className="text-[#dc0000] flex items-center gap-1.5">
            <span>⚠</span>
            <span>{count} CLASH{count === 1 ? '' : 'ES'} FOUND</span>
          </span>
        ) : (
          <span className="text-[#15803d]">✓ ALL CLEAR (0 CLASHES)</span>
        )}
      </div>

      <div className="h-[1px] bg-black w-full mb-1"></div>

      {/* Clash Rows (Max 6) */}
      <div className="divide-y divide-[#eeeeee] max-h-[175px] overflow-y-auto">
        {count === 0 ? (
          <div className="py-2 text-[11px] text-[#666666] text-center font-bold">
            No 3D spatial collisions detected.
          </div>
        ) : (
          displayList.map((c, idx) => (
            <div
              key={c.id || idx}
              className="py-1.5 flex items-center justify-between text-[11px]"
            >
              <span className="font-bold text-black uppercase truncate pr-2">
                [{c.newType}] ↔ [{c.existingType || c.existingAgency || 'UTILITY'}]
              </span>
              <span className="text-[#dc0000] font-mono font-bold shrink-0">
                · {typeof c.distance === 'number' ? c.distance.toFixed(2) : c.distance}m
              </span>
            </div>
          ))
        )}

        {remaining > 0 && (
          <div className="py-1 text-[10px] text-[#666666] italic text-center font-bold">
            …and {remaining} more
          </div>
        )}
      </div>

      <div className="h-[1px] bg-black w-full mt-1 mb-3"></div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => autoFixAll()}
          disabled={count === 0 || rerouteInProgress}
          className={`flex-1 py-1.5 px-2 text-xs font-bold uppercase border border-black shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ${
            count === 0
              ? 'bg-[#e5e5e5] text-[#888888] cursor-not-allowed shadow-none'
              : rerouteInProgress
              ? 'bg-[#dc0000]/80 text-white cursor-wait'
              : 'bg-[#dc0000] text-white hover:bg-[#b91c1c]'
          }`}
        >
          {rerouteInProgress ? 'REROUTING…' : count === 0 ? 'ALL CLEAR' : 'AUTO-FIX ALL'}
        </button>

        <button
          onClick={() => clearScan()}
          className="py-1.5 px-3 text-xs font-bold uppercase border border-black bg-white text-black shadow-[3px_3px_0_0_#000] hover:bg-[#f5f5f5] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        >
          CLEAR
        </button>
      </div>
    </div>
  );
};
