import React, { useState } from 'react';
import { WindowPreview3D } from './WindowPreview3D';
import { StoriesModal } from './StoriesModal';
import { useStore } from '../../store';
import { audioFX } from './AudioFX';

interface LandingPageProps {
  onEnterApp: (directStreetId?: string) => void;
  onOpenWizard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const { stage, setStage, currentUser, openAuth, openPortal } = useStore();
  const [storiesOpen, setStoriesOpen] = useState(false);

  const handleSignInClick = () => {
    audioFX.playClick();
    if (currentUser) {
      openPortal();
    } else {
      openAuth();
    }
  };

  const handleExploreClick = () => {
    audioFX.playClick();
    if (currentUser) {
      openPortal();
    } else {
      openAuth();
    }
  };

  const handleStoriesClick = () => {
    audioFX.playClick();
    setStoriesOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#0c0d10] text-white font-mono flex flex-col justify-between p-4 sm:p-8 select-none relative overflow-x-hidden">
      {/* Subtle Background Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />

      {/* =========================================================================
          TOP BAR (Minimal, matching reference image)
          ========================================================================= */}
      <header className="relative z-10 w-full flex items-center justify-between gap-4">
        {/* Left: Minimal Icon Button / Brand Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-black border-2 border-white/80 hard-shadow-sm flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-colors">
            <span className="text-sm font-black">☰</span>
          </div>
          <span className="hidden sm:inline-block font-mono text-xs font-bold tracking-wider uppercase text-slate-300">
            BENGALURU DIGITAL TWIN
          </span>
        </div>

        {/* Right: Dedicated SIGN IN / PROFILE Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSignInClick}
            className="bg-black hover:bg-[#1a1e29] text-white border-2 border-white/80 hard-shadow-sm px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span className="w-2 h-2 bg-[#eab308] inline-block" />
            <span>{currentUser ? `PROFILE (${currentUser.fullName.split(' ')[0]})` : '■ SIGN IN'}</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION (2-Column Minimal Layout matching reference image)
          ========================================================================= */}
      <main className="relative z-10 w-full max-w-7xl mx-auto my-auto py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Bold Typography & CTAs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Display Headline */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight text-white leading-none">
              WHERE BUILDERS
              <br />
              SHAPE
            </h1>
            {/* Highlighted Bold Block */}
            <div className="inline-block bg-[#eab308] text-black px-3 py-1 font-black text-3xl sm:text-5xl xl:text-6xl uppercase tracking-tight border-2 border-black hard-shadow mt-1">
              BENGALURU&apos;S VEINS
            </div>
          </div>

          {/* Subtitle Prose */}
          <p className="text-sm sm:text-base text-slate-300 font-sans max-w-lg leading-relaxed">
            The browser-native 3D digital twin for subterranean multi-utility coordination, 8-meter vertical road explode view, real-time pipe clash detection, and BBMP municipal zoning compliance.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={handleExploreClick}
              className="bg-white hover:bg-slate-200 text-black border-2 border-black hard-shadow px-6 py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span>EXPLORE 3D</span>
              <span className="font-bold">→</span>
            </button>

            <button
              onClick={handleStoriesClick}
              className="bg-black hover:bg-[#182030] text-white border-2 border-white/60 hard-shadow-sm px-6 py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span>THE PROBLEM</span>
              <span className="text-[#eab308]">ℹ</span>
            </button>
          </div>

          {/* Clean Sub-telemetry */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono">
            <span>● 7 Utilities Mapped</span>
            <span>·</span>
            <span>0.3m Clash Radar</span>
            <span>·</span>
            <span>100% In-Browser</span>
          </div>
        </div>

        {/* Right Column: Retro OS / CAD Window Frame with 3D Preview */}
        <div className="lg:col-span-6 w-full flex justify-center">
          <div className="w-full max-w-xl bg-white border-2 border-black hard-shadow relative">
            {/* Window Title Bar with Traffic Light Dots */}
            <div className="bg-black text-white px-3 py-2 flex items-center justify-between border-b-2 border-black">
              {/* Traffic light dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block" />
              </div>
              {/* File Title */}
              <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider truncate px-2">
                bengaluru-corridor-twin.cad
              </div>
              {/* Right Mini Tool */}
              <div className="text-[9px] bg-white/20 px-1 py-0.5 text-white uppercase">
                3D VIEW
              </div>
            </div>

            {/* Embedded Interactive 3D Canvas */}
            <div className="w-full h-[320px] sm:h-[400px]">
              <WindowPreview3D />
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          BOTTOM FOOTER
          ========================================================================= */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 pt-4 border-t border-white/10">
        <div>BBMP South Zone · Karnataka Municipal GIS · WGS84 Datum</div>
        <div>LAT 12.9716° N · LNG 77.5946° E</div>
      </footer>

      {/* Stories & Problems Modal */}
      <StoriesModal isOpen={storiesOpen} onClose={() => setStoriesOpen(false)} />
    </div>
  );
};
