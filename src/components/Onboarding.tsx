import React from 'react';
import { useStore } from '../store';
import { CITIES, getCity, getArea } from '../dataHelpers';

export const Onboarding: React.FC = () => {
  const {
    wizardCity,
    wizardArea,
    wizardStreet,
    setWizardCity,
    setWizardArea,
    setWizardStreet,
    confirmSelection,
  } = useStore();

  const currentCity = getCity(wizardCity);
  const currentArea = getArea(wizardCity, wizardArea);
  const streets = currentArea?.streets || [];

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-white border border-black hard-shadow p-6 text-black">
        {/* Technical Header */}
        <div className="border-b border-black pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-[#dc0000]"></span>
              <span className="font-mono text-xs font-bold tracking-widest uppercase text-black">
                BBMP GIS SPATIAL TWIN v1.0
              </span>
            </div>
            <button
              onClick={() => useStore.getState().returnToLanding()}
              className="font-mono text-xs text-[#dc0000] hover:underline uppercase font-bold cursor-pointer"
            >
              ✦ Overview / Stories
            </button>
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase mt-2">
            Bengaluru Digital Twin
          </h1>
          <p className="text-xs font-mono text-[#444444] mt-1 leading-relaxed">
            Multi-utility coordination · Underground clash detection · Sun shadow simulation · Municipal zoning check.
          </p>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4 font-mono text-xs">
          {/* City select */}
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#333333] mb-1">
              01 // Jurisdiction City
            </label>
            <select
              aria-label="Jurisdiction City"
              value={wizardCity}
              onChange={(e) => setWizardCity(e.target.value)}
              className="w-full bg-[#f8f8f8] border border-black p-2 font-mono text-xs text-black focus:outline-none focus:bg-[#fff9e6]"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.toUpperCase()} (BBMP SOUTH)
                </option>
              ))}
            </select>
          </div>

          {/* Area select */}
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#333333] mb-1">
              02 // Municipal Ward / Area
            </label>
            <select
              aria-label="Municipal Ward / Area"
              value={wizardArea}
              onChange={(e) => setWizardArea(e.target.value)}
              className="w-full bg-[#f8f8f8] border border-black p-2 font-mono text-xs text-black focus:outline-none focus:bg-[#fff9e6]"
            >
              {currentCity.areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Street select */}
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[#333333] mb-1">
              03 // Target Corridor / Street
            </label>
            <select
              aria-label="Target Corridor / Street"
              value={wizardStreet}
              onChange={(e) => setWizardStreet(e.target.value)}
              className="w-full bg-[#f8f8f8] border border-black p-2 font-mono text-xs text-black focus:outline-none focus:bg-[#fff9e6]"
            >
              {streets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.problem ? ' [HIGH UTILITY CONFLICT]' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Technical Callout */}
        <div className="bg-[#fff9e6] border border-[#e5a914] hard-shadow-sm p-3 my-5 font-mono text-[11px] text-[#6b4700]">
          <div className="flex items-center gap-1 font-bold tracking-wider uppercase mb-1">
            <span>⚠</span> PRESELECTED CORRIDOR: UTTARAHALLI MAIN ROAD
          </div>
          <div>
            7 concurrent underground mains (BWSSB Water, GAIL Gas, Telecom Fiber, BESCOM 11kV Power). Ready for explode inspection.
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={confirmSelection}
          className="w-full bg-[#dc0000] text-white border border-black hard-shadow hover:bg-[#b00000] active:translate-x-[2px] active:translate-y-[2px] p-3 text-sm font-bold tracking-wider uppercase transition-none cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Enter Digital Twin</span>
          <span className="font-mono">→</span>
        </button>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-[#e0e0e0] flex items-center justify-between text-[10px] font-mono text-[#888888]">
          <span>ONE-CLICK INSTANT COLD BOOT</span>
          <span>LAT 12.9716° N · LNG 77.5946° E</span>
        </div>
      </div>
    </div>
  );
};
