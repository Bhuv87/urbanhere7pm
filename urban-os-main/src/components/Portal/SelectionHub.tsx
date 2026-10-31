import React from 'react';
import { useStore } from '../../store';

interface SelectionHubProps {
  onSelectLayout: (streetId?: string) => void;
  onOpenWizard: () => void;
}

export const SelectionHub: React.FC<SelectionHubProps> = ({ onSelectLayout, onOpenWizard }) => {
  const { currentUser, logout, setStage, setActiveSidebarTab } = useStore();

  return (
    <div className="min-h-screen bg-[#0c0d10] text-white font-mono flex flex-col justify-between p-4 sm:p-8 select-none relative overflow-x-hidden">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] pointer-events-none" />

      {/* Top Navigation & User Identity Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/20 gap-3">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 bg-[#dc0000] inline-block" />
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
              BENGALURU DIGITAL TWIN // OPERATIONAL HUB
            </h1>
            <p className="text-[11px] text-slate-400">
              Karnataka Municipal GIS · South Zone Grid 184
            </p>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-[#182030] border border-white/20 px-3 py-1 text-xs">
            <span className="text-slate-400 font-normal">LOGGED IN: </span>
            <span className="text-white font-bold">{currentUser?.fullName || 'Field Engineer'}</span>
            <span className="text-[#00aaff] ml-1.5 uppercase font-bold text-[10px]">
              [{currentUser?.role || 'ENGINEER'}]
            </span>
          </div>

          <button
            onClick={() => setStage('landing')}
            className="border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1 text-xs font-bold uppercase transition-none cursor-pointer"
          >
            Landing
          </button>

          <button
            onClick={logout}
            className="border border-[#dc0000]/50 text-[#dc0000] bg-transparent hover:bg-[#dc0000] hover:text-white px-3 py-1 text-xs font-bold uppercase transition-none cursor-pointer"
          >
            Exit / Sign Out
          </button>
        </div>
      </header>

      {/* Main Two-Card Selection Container */}
      <main className="relative z-10 max-w-6xl w-full mx-auto my-auto py-8">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-block bg-[#dc0000] text-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest mb-2">
            SELECT WORKSPACE MODULE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            CHOOSE YOUR OPERATIONAL DOMAIN
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Select the required workflow module below to initiate corridor 3D modeling or statutory departmental review.
          </p>
        </div>

        {/* The 2 Primary Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* =========================================================================
              CARD 1: 3D Twin & Utility Layout Engine (ACTIVE & FULLY INTERACTIVE)
              ========================================================================= */}
          <div
            onClick={() => onSelectLayout('utt-main')}
            className="bg-[#141822] border-2 border-white/40 hover:border-[#dc0000] hover:bg-[#182030] p-6 sm:p-8 hard-shadow-red transition-none cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Top Badge */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <span className="text-[11px] font-bold text-[#dc0000] tracking-widest uppercase">
                  MODULE 01 // 3D CORRIDOR ENGINE
                </span>
                <span className="bg-[#00cc66] text-black text-[10px] px-2 py-0.5 font-bold uppercase">
                  ● ACTIVE SYSTEM
                </span>
              </div>

              {/* Graphic Icon Header */}
              <div className="my-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-black border-2 border-white/30 flex items-center justify-center text-2xl group-hover:border-[#dc0000]">
                  🏗️
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-white group-hover:text-[#dc0000] transition-colors">
                    3D Twin &amp; Utility Layout
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Subsurface Pipelines, Houses, Explode View &amp; Clash Detection
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mb-4">
                Launch the full interactive 3D corridor digital twin. Inspect subterranean pipelines (BWSSB, GAIL, BESCOM, OFC), route new domestic connections, place from 11 authentic Bengaluru house typologies, trigger 8m vertical road explode, and run real-time clash &amp; CAD zoning audits.
              </p>

              {/* Feature Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] text-slate-300">
                  8m Road Explode
                </span>
                <span className="bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] text-slate-300">
                  0.3m Clash Detection
                </span>
                <span className="bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] text-slate-300">
                  11 House Models
                </span>
                <span className="bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] text-slate-300">
                  STEP/CAD Parser
                </span>
                <span className="bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] text-slate-300">
                  SunCalc Solar
                </span>
                <span className="bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] text-slate-300">
                  GeoJSON Export
                </span>
              </div>
            </div>

            {/* Bottom Button Action */}
            <div className="mt-8 pt-4 border-t border-white/15 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLayout('utt-main');
                }}
                className="flex-1 bg-[#dc0000] hover:bg-[#b00000] text-white py-3 px-4 font-bold text-xs uppercase tracking-wider text-center cursor-pointer hard-shadow-sm flex items-center justify-center gap-2"
              >
                <span>OPEN 3D LAYOUT (UTTARAHALLI)</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenWizard();
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white py-3 px-3 font-bold text-xs uppercase cursor-pointer"
                title="Select a different ward or street"
              >
                Choose Ward
              </button>
            </div>
          </div>

          {/* CARD 2: Government Details & Statutory Portals (UNLOCKED) */}
          <div
            onClick={() => {
              setActiveSidebarTab('directory');
              onSelectLayout();
            }}
            className="bg-[#12151c] hover:bg-[#151922] border-2 border-white/20 hover:border-[#00cc66] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden select-none cursor-pointer group shadow-[3px_3px_0_0_#000] transition-all"
            title="Open Module 02 Statutory Government Directory"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <span className="text-[11px] font-bold text-slate-300 tracking-widest uppercase">
                  MODULE 02 // STATUTORY GOVERNMENT DIRECTORY
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 font-bold uppercase flex items-center gap-1">
                  <span>●</span> UNLOCKED
                </span>
              </div>

              <div className="my-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-black/60 border-2 border-[#00cc66] flex items-center justify-center text-2xl text-emerald-400">
                  🏛️
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-white group-hover:text-[#00cc66] transition-colors">
                    Government &amp; Dept Portals
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    BWSSB · BBMP · BESCOM · GAIL Statutory Registry
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mb-4">
                Centralized civic repository for departmental coordination: original links, Right of Way (RoW) trenching permits, water supply blueprints, high-tension electrical substation lines, and municipal gazette notifications.
              </p>

              <div className="space-y-2 pt-1 font-mono text-xs">
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  ACTIVE DEPARTMENTS (CLICK TO ACCESS DIRECTORY):
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/60 border border-white/15 p-2 text-[11px] text-slate-300">
                    <span className="font-bold text-[#00aaff] block">BWSSB</span>
                    Cauvery Water &amp; Drainage Board
                  </div>
                  <div className="bg-black/60 border border-white/15 p-2 text-[11px] text-slate-300">
                    <span className="font-bold text-[#ff3300] block">BESCOM</span>
                    Bangalore Electricity Supply Corp
                  </div>
                  <div className="bg-black/60 border border-white/15 p-2 text-[11px] text-slate-300">
                    <span className="font-bold text-[#ff8800] block">GAIL Gas</span>
                    City Gas Distribution Network
                  </div>
                  <div className="bg-black/60 border border-white/15 p-2 text-[11px] text-slate-300">
                    <span className="font-bold text-[#00cc66] block">BBMP</span>
                    Bruhat Bengaluru Mahanagara Palike
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/15">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSidebarTab('directory');
                  onSelectLayout();
                }}
                className="w-full bg-[#00cc66] hover:bg-[#00b355] text-black border border-black py-3 px-4 font-bold text-xs uppercase tracking-wider text-center cursor-pointer shadow-[3px_3px_0_0_#000] flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
              >
                <span>Access Statutory Directory ⟶</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto text-center text-xs text-slate-500 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Bengaluru Digital Twin · Urban Infrastructure &amp; Utility Engine</span>
        <span>LAT 12.9716° N · LNG 77.5946° E</span>
      </footer>
    </div>
  );
};
