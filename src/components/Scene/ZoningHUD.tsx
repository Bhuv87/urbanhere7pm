import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';

export const ZoningHUD: React.FC = () => {
  const {
    cadModel,
    zoningReport,
    zoningHeightLimit,
    setZoningHeightLimit,
    newHouses,
    houseModels,
    streetId,
  } = useStore();

  const [expanded, setExpanded] = useState<boolean>(true);

  // Tally placed houses height compliance
  const houseAudit = useMemo(() => {
    const houses = newHouses[streetId] || [];
    let passCount = 0;
    let failCount = 0;
    for (const h of houses) {
      const m = (h.modelId && houseModels.find((model) => model.id === h.modelId)) ||
                houseModels.find((model) => model.category === h.type);
      const hHeight = h.customHeight || (m ? m.height : 6.8);
      if (hHeight > zoningHeightLimit) {
        failCount++;
      } else {
        passCount++;
      }
    }
    return { total: houses.length, passCount, failCount };
  }, [newHouses, streetId, houseModels, zoningHeightLimit]);

  const hasCAD = !!(cadModel && zoningReport);
  const isOverallPass = hasCAD
    ? zoningReport.allPass && houseAudit.failCount === 0
    : houseAudit.failCount === 0;

  return (
    <div
      className={`absolute top-3 right-3 w-80 bg-white border-2 font-mono text-xs hard-shadow z-30 select-none ${
        isOverallPass ? 'border-black' : 'border-[#dc0000]'
      }`}
    >
      {/* HUD Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-black text-white border-b border-black">
        <div className="flex items-center gap-1.5">
          <span className="text-[#eab308] font-bold">🏛</span>
          <span className="font-bold tracking-widest uppercase text-[10px]">
            BBMP ZONING & HEIGHT LIMIT
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`px-1 py-0.2 text-[9px] font-bold text-white uppercase ${
              isOverallPass ? 'bg-[#00aa44]' : 'bg-[#dc0000]'
            }`}
          >
            {isOverallPass ? 'COMPLIANT' : 'VIOLATION'}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white hover:text-[#eab308] font-bold text-xs px-1 cursor-pointer"
            title={expanded ? 'Collapse HUD' : 'Expand HUD'}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-2.5 space-y-2.5 bg-white text-black">
          {/* 1. MUNICIPAL HEIGHT LIMIT ADJUSTER */}
          <div className="border border-black p-2 bg-[#f8fafc] space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-[#dc0000] uppercase tracking-wide">
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
                  className="w-14 border border-black px-1 py-0.5 text-right font-mono font-bold bg-white text-xs"
                />
                <span className="font-bold text-xs">m</span>
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="120"
              step="0.5"
              value={zoningHeightLimit}
              onChange={(e) => setZoningHeightLimit(Number(e.target.value))}
              className="w-full accent-[#dc0000] cursor-pointer h-1.5"
            />

            {/* Quick BBMP Presets */}
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              {[
                { label: '11.5m (G+2)', val: 11.5 },
                { label: '15m (G+3)', val: 15.0 },
                { label: '24m (G+7)', val: 24.0 },
                { label: '30m (BBMP)', val: 30.0 },
                { label: '45m (Tower)', val: 45.0 },
                { label: '60m (High)', val: 60.0 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setZoningHeightLimit(p.val)}
                  className={`py-0.5 text-[9px] font-bold border border-black cursor-pointer truncate ${
                    zoningHeightLimit === p.val
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-[#e2e8f0]'
                  }`}
                  title={`Set ceiling to ${p.val}m`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. PLACED HOUSES HEIGHT AUDIT */}
          <div className="flex justify-between items-center text-[11px] px-1">
            <span className="text-[#555555]">Placed Houses Audit:</span>
            <span className="font-bold">
              {houseAudit.total === 0 ? (
                <span className="text-[#888888]">None Placed</span>
              ) : houseAudit.failCount > 0 ? (
                <span className="text-[#dc0000] font-bold">
                  {houseAudit.failCount}/{houseAudit.total} Exceed Limit
                </span>
              ) : (
                <span className="text-[#00aa44] font-bold">
                  All {houseAudit.total} Pass
                </span>
              )}
            </span>
          </div>

          {/* 3. CAD TOWER ZONING REPORT (If loaded) */}
          {hasCAD && zoningReport && (
            <div className="border-t border-[#e2e8f0] pt-2 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-black uppercase">
                <span>CAD Tower Audit:</span>
                <span
                  className={zoningReport.allPass ? 'text-[#00aa44]' : 'text-[#dc0000]'}
                >
                  [{zoningReport.allPass ? 'APPROVED' : 'REJECTED'}]
                </span>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#555555]">Tower Height:</span>
                  <span className="font-bold">
                    {zoningReport.height}m / {zoningReport.maxHeight}m{' '}
                    <span className={zoningReport.heightPass ? 'text-[#00aa44]' : 'text-[#dc0000]'}>
                      [{zoningReport.heightPass ? 'PASS' : 'FAIL'}]
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#555555]">Perimeter Setback:</span>
                  <span className="font-bold">
                    {zoningReport.setback}m / {zoningReport.minSetback}m{' '}
                    <span className={zoningReport.setbackPass ? 'text-[#00aa44]' : 'text-[#dc0000]'}>
                      [{zoningReport.setbackPass ? 'PASS' : 'FAIL'}]
                    </span>
                  </span>
                </div>
              </div>

              {zoningReport.details.length > 0 && (
                <div className="pt-1 text-[9px] text-[#dc0000] space-y-0.5">
                  {zoningReport.details.map((d, i) => (
                    <div key={i}>⚠ {d}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer note */}
          <div className="text-[9px] text-[#777777] border-t border-[#e2e8f0] pt-1">
            Visual 3D regulatory ceiling plane tracks live at Y = {zoningHeightLimit.toFixed(1)}m.
          </div>
        </div>
      )}
    </div>
  );
};
