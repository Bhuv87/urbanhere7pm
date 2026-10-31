import React from 'react';
import { useStore } from '../../store';
import { formatTimeLabel } from '../../utils/solar';

export const SolarPanel: React.FC = () => {
  const { solarTime, setSolarTime, shadowedPanels, selectedObjectId, newHouses, streetId, toggleHouseSolar } = useStore();
  const selectedHouse = (newHouses[streetId] || []).find((house) => house.id === selectedObjectId);
  const equippedHouses = (newHouses[streetId] || []).filter((house) => house.solarPanels).length;

  const totalPanels = 24; // 6x4 array
  const shadowedCount = shadowedPanels.length;
  const activeCount = totalPanels - shadowedCount;
  const efficiencyPercent = Math.round((activeCount / totalPanels) * 100);

  return (
    <div className="border border-black p-2.5 bg-white hard-shadow-sm mb-3">
      <div className="font-mono text-[11px] font-bold tracking-widest uppercase text-black pb-1.5 border-b border-black mb-2 flex items-center justify-between">
        <span>06 // SOLAR & SHADOW SIM</span>
        <span className="text-[10px] text-[#666666]">SUNCALC</span>
      </div>

      {/* Time Slider */}
      <div className="mb-2">
        <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
          <span className="text-[#333333]">SUN TIME:</span>
          <span className="bg-black text-white px-1.5 py-0.5">
            ☀ {formatTimeLabel(solarTime)}
          </span>
        </div>
        <input
          type="range"
          min="6"
          max="18"
          step="0.5"
          value={solarTime}
          onChange={(e) => setSolarTime(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-[#e0e0e0] accent-[#dc0000] cursor-pointer"
        />
        <div className="flex justify-between font-mono text-[9px] text-[#777777] mt-0.5">
          <span>06:00 AM</span>
          <span>12:00 PM</span>
          <span>06:00 PM</span>
        </div>
      </div>

      <div className="mb-2 border border-black p-2 font-mono text-[10px]">
        <div className="flex justify-between font-bold mb-1">
          <span>PLACED HOUSE ARRAYS:</span>
          <span>{equippedHouses}</span>
        </div>
        {selectedHouse ? (
          <button
            onClick={() => toggleHouseSolar(streetId, selectedHouse.id)}
            className="w-full border border-black bg-white hover:bg-black hover:text-white px-2 py-1 font-bold uppercase cursor-pointer"
          >
            {selectedHouse.solarPanels ? 'REMOVE SOLAR FROM SELECTED HOUSE' : 'ADD SOLAR TO SELECTED HOUSE'}
          </button>
        ) : (
          <div className="text-[#555555]">Select a placed house in the 3D view to add rooftop solar.</div>
        )}
      </div>

      {/* Solar Array Efficiency Monitor */}
      <div className="p-2 bg-[#f8f8f8] border border-black font-mono text-[10px] space-y-1">
        <div className="flex justify-between font-bold">
          <span>ROOF ARRAY STATUS:</span>
          <span className={shadowedCount > 0 ? 'text-[#dc0000]' : 'text-[#008800]'}>
            {shadowedCount > 0 ? `SHADOWED (${shadowedCount}/${totalPanels})` : 'FULL SUNLIGHT'}
          </span>
        </div>

        <div className="flex justify-between text-[#555555]">
          <span>ARRAY EFFICIENCY:</span>
          <span className="font-bold text-black">{efficiencyPercent}%</span>
        </div>

        <div className="w-full bg-[#dddddd] h-2 border border-black overflow-hidden mt-1">
          <div
            className={`h-full ${efficiencyPercent > 60 ? 'bg-[#00aaff]' : 'bg-[#dc0000]'}`}
            style={{ width: `${efficiencyPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
