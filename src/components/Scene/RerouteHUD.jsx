import React from 'react';
import { useStore } from '../../store';

export const RerouteHUD = () => {
  const { rerouteMetrics, clearRerouteMetrics, scanResults } = useStore();

  if (!rerouteMetrics) return null;

  const fmtClearance = (val) => {
    if (val === undefined || val === null) return '0.00m';
    const num = Number(val);
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}m`;
  };

  const fmtDelta = (val) => {
    if (val === undefined || val === null) return '±0.0m';
    const num = Number(val);
    if (Math.abs(num) < 0.05) return '±0.0m';
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}m`;
  };

  const fmtCost = (val) => {
    const cost = Math.max(0, Math.round(Number(val) || 0));
    return `+₹${cost.toLocaleString('en-IN')}`;
  };

  return (
    <div className="absolute top-4 left-4 z-30 bg-white border border-black shadow-[3px_3px_0_0_#000] p-3.5 w-full max-w-[280px] select-none font-mono">
      {/* Top Title & Close Button */}
      <div className="flex items-center justify-between pb-2 border-b border-black pr-6 relative">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 ${scanResults?.length ? 'bg-[#dc0000]' : 'bg-[#15803d]'}`}></span>
          <span className="font-bold text-[11px] uppercase tracking-wider text-black">
            {scanResults?.length ? `AUTO-REROUTE: ${scanResults.length} REMAIN` : 'AUTO-REROUTE COMPLETE'}
          </span>
        </div>
        <button
          onClick={() => clearRerouteMetrics()}
          className="absolute -top-1 right-0 w-5 h-5 flex items-center justify-center border border-black bg-white hover:bg-[#f0f0f0] text-black font-bold text-xs cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
          title="Dismiss HUD"
        >
          ×
        </button>
      </div>

      {/* Metrics Rows */}
      <div className="pt-2 space-y-1.5 text-xs">
        {/* CLEARANCE */}
        <div className="flex items-center justify-between">
          <span className="text-[#666666] font-bold text-[10px] uppercase">CLEARANCE</span>
          <div className="font-mono font-bold text-[11px] flex items-center">
            <span className="text-[#dc0000]">
              {fmtClearance(rerouteMetrics.clearanceBefore)}
            </span>
            <span className="text-black mx-1">→</span>
            <span className={rerouteMetrics.clearanceAfter >= 0.3 ? 'text-[#15803d]' : 'text-[#dc0000]'}>
              {fmtClearance(rerouteMetrics.clearanceAfter)}
            </span>
          </div>
        </div>

        {/* LENGTH DELTA */}
        <div className="flex items-center justify-between">
          <span className="text-[#666666] font-bold text-[10px] uppercase">LENGTH Δ</span>
          <span className="font-mono font-bold text-[11px] text-black">
            {fmtDelta(rerouteMetrics.lengthDelta)}
          </span>
        </div>

        {/* DEPTH DELTA */}
        <div className="flex items-center justify-between">
          <span className="text-[#666666] font-bold text-[10px] uppercase">DEPTH Δ</span>
          <span className="font-mono font-bold text-[11px] text-black">
            {fmtDelta(rerouteMetrics.depthDelta)}
          </span>
        </div>

        {/* COST EST */}
        <div className="flex items-center justify-between pt-1 border-t border-[#e5e5e5]">
          <span className="text-[#666666] font-bold text-[10px] uppercase">COST EST</span>
          <span className="font-mono font-bold text-[12px] text-black">
            {fmtCost(rerouteMetrics.costEst)}
          </span>
        </div>
      </div>
    </div>
  );
};
