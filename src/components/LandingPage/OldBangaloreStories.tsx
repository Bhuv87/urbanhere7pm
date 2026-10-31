import React, { useState } from 'react';
import { audioFX } from './AudioFX';

interface StoryChapter {
  id: string;
  era: string;
  title: string;
  kannadaSubtitle: string;
  problem: string;
  history: string;
  twinSolution: string;
  metrics: { label: string; val: string }[];
}

const STORIES: StoryChapter[] = [
  {
    id: 'kempe-gowda',
    era: '1537 CE — 1960s',
    title: 'KEMPE GOWDA’S LABYRINTH & THE 1,000 LOST LAKES',
    kannadaSubtitle: 'ಕೆಂಪೇಗೌಡರ ಕಲ್ಯಾಣಿಗಳು ಮತ್ತು ಕಣ್ಮರೆಯಾದ ಕೆರೆಗಳು',
    history:
      'In 1537, Nadaprabhu Kempe Gowda established Bengaluru on a semi-arid Deccan plateau with no perennial river. To sustain life, ancient hydraulic planners engineered an interconnected cascade of over 1,000 lakes (keres) and stepwells (kalyanis) linked by subterranean natural canals (raja kaluves).',
    problem:
      'As Bengaluru exploded into India’s Silicon Valley, over 85% of lakes were paved over. High-density residential plots were plotted directly over unmapped subterranean aquifers and drainage veins. Without 3D depth intelligence, modern civil foundations routinely puncture natural conduits, causing annual urban flash-flooding and ground subsidence.',
    twinSolution:
      'The Digital Twin models subterranean hydraulic gradients alongside underground utilities, giving municipal engineers full 3D visual depth from 0m down to bedrock (-5.0m).',
    metrics: [
      { label: 'Original Lakes', val: '1,000+' },
      { label: 'Lost / Built Over', val: '86%' },
      { label: 'Unmapped Raluves', val: '840 km' },
    ],
  },
  {
    id: 'triple-dig',
    era: '2000s — PRESENT',
    title: 'THE "TRIPLE-DIG" WAR: BWSSB vs BESCOM vs GAIL vs OFC',
    kannadaSubtitle: 'ರಸ್ತೆ ಅಗೆಯುವ ಅವಾಂತರ: ನಾಲ್ಕು ಇಲಾಖೆಗಳ ಸಮರ',
    history:
      'Every Bengalurean knows the tragicomic cycle: BBMP paves a pristine asphalt road in Uttarahalli or Kanakapura. Two weeks later, BWSSB excavates for Cauvery Stage IV water mains. Months later, GAIL digs for city gas. Soon after, telecom operators deploy JCBs to trench optic fiber lines.',
    problem:
      'In a notorious incident in South Bengaluru, an unmapped JCB trenching operation for broadband cable sliced through a high-pressure 600mm BWSSB water feeder and an adjacent 11kV BESCOM underground cable. Over 45,000 households were left without water and electricity for 96 hours, causing ₹18 Crores in emergency repair damages.',
    twinSolution:
      'Our sub-millimeter 3D spatial clash detection alerts routing engineers the instant a proposed gas, power, or water lateral violates the mandatory 0.3m safety clearance threshold.',
    metrics: [
      { label: 'Repeated Dig Cost', val: '₹2,400 Cr/yr' },
      { label: 'Unmapped Utility Clashes', val: '1,420+' },
      { label: 'Clearance Guard', val: '0.3m Spatial' },
    ],
  },
  {
    id: 'bda-solar',
    era: 'MODERN RESIDENTIAL',
    title: 'THE 30x40 BDA PLOT & THE VANISHING ROOFTOP SUN',
    kannadaSubtitle: 'ಬಿಡಿಎ ನಿವೇಶನ ಮತ್ತು ಮಾಯವಾಗುತ್ತಿರುವ ಬಿಸಿಲು',
    history:
      'For decades, Bengaluru’s middle-class dream was built on standard Bangalore Development Authority (BDA) layout sites: 20x30 FT (600 sqft), 30x40 FT (1,200 sqft), and 40x60 FT (2,400 sqft). Citizens pioneered India’s largest adoption of rooftop solar water heaters and solar panels.',
    problem:
      'Rapid, unapproved G+4 and G+5 commercial towers sprouted on narrow 30ft residential roads without the mandatory 3.0m BBMP perimeter setback. These monolithic concrete towers cast deep shadows over neighboring residential rooftops, cutting photovoltaic solar generation and hot water efficiency by up to 74%.',
    twinSolution:
      'Integrated SunCalc ephemeris calculates sun position for Bengaluru’s exact latitude (12.9716° N) at any hour of the day, raycasting real-time building shadows onto rooftop solar panel arrays to calculate efficiency loss.',
    metrics: [
      { label: 'Standard Plot', val: '30x40 FT' },
      { label: 'Solar Yield Drop', val: 'Up to 74%' },
      { label: 'Setback Buffer', val: '3.0m Required' },
    ],
  },
];

export const OldBangaloreStories: React.FC = () => {
  const [activeStory, setActiveStory] = useState<number>(0);
  const story = STORIES[activeStory];

  const handleSelect = (idx: number) => {
    setActiveStory(idx);
    audioFX.playClick(1000 + idx * 200);
  };

  return (
    <section id="stories" className="py-16 md:py-24 bg-[#0a0d12] text-white border-b-2 border-black relative overflow-hidden select-none">
      {/* Subtle Technical Grid Lines */}
      <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="border-b border-white/20 pb-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#dc0000] uppercase tracking-widest mb-1.5">
              <span>// 02. CHRONICLES OF THE DECCAN PLATEAU</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
              BENGALURU: BENEATH THE SURFACE
            </h2>
            <p className="font-mono text-xs md:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Why we built this: The collision between 500 years of historic urban layout, 14 uncoordinated utility agencies, and the modern vertical density boom.
            </p>
          </div>

          {/* Chapter Selector Tabs */}
          <div className="flex items-center gap-1 bg-white/10 p-1 border border-white/20 font-mono text-xs">
            {STORIES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleSelect(idx)}
                className={`px-3 py-1.5 font-bold uppercase transition-none cursor-pointer ${
                  activeStory === idx
                    ? 'bg-[#dc0000] text-white hard-shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                0{idx + 1}. {s.era.split('—')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Active Story Card - Neo-Brutalist Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#111620] border-2 border-white/30 p-6 md:p-8 hard-shadow-red relative">
          {/* Left Column: Story Prose & History */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border-b border-white/15 pb-4">
              <span className="font-mono text-[11px] bg-white/10 text-[#00aaff] px-2 py-0.5 border border-[#00aaff]/40 uppercase font-bold tracking-wider">
                ERA: {story.era}
              </span>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mt-3">
                {story.title}
              </h3>
              <div className="text-sm font-medium text-amber-400/90 font-serif mt-1">
                {story.kannadaSubtitle}
              </div>
            </div>

            {/* Historical Context */}
            <div className="space-y-2">
              <div className="font-mono text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00aaff]" />
                HISTORICAL CONTEXT:
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {story.history}
              </p>
            </div>

            {/* The Urban Crisis / Problem */}
            <div className="bg-[#1e1313] border-l-4 border-[#dc0000] p-4 space-y-1.5">
              <div className="font-mono text-xs font-bold text-[#dc0000] uppercase flex items-center gap-2">
                <span>⚠️</span>
                THE SUBTERRANEAN CRISIS (THE PROBLEM):
              </div>
              <p className="text-xs md:text-sm text-red-200/90 leading-relaxed font-mono">
                {story.problem}
              </p>
            </div>

            {/* Digital Twin Solution */}
            <div className="bg-[#0b1d28] border-l-4 border-[#00aaff] p-4 space-y-1.5">
              <div className="font-mono text-xs font-bold text-[#00aaff] uppercase flex items-center gap-2">
                <span>⚡</span>
                DIGITAL TWIN RESOLUTION:
              </div>
              <p className="text-xs md:text-sm text-cyan-200/90 leading-relaxed font-mono">
                {story.twinSolution}
              </p>
            </div>
          </div>

          {/* Right Column: Visual Telemetry, Metrics & Spatial Artifact */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 border-t lg:border-t-0 lg:border-l border-white/20 pt-6 lg:pt-0 lg:pl-6">
            {/* Quantitative Metrics Cards */}
            <div className="space-y-3">
              <div className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                FIELD TELEMETRY &amp; IMPACT:
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {story.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-[#182030] border border-white/20 p-3.5 flex items-center justify-between"
                  >
                    <span className="font-mono text-xs text-slate-300 uppercase">
                      {m.label}
                    </span>
                    <span className="font-mono text-xl font-bold text-white tabular-nums">
                      {m.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spatial Quote Box */}
            <div className="bg-[#182030]/80 border border-amber-500/40 p-4 font-mono text-xs text-amber-200/90 space-y-2">
              <div className="font-bold text-amber-400 uppercase text-[10px]">
                MUNICIPAL FIELD INSIGHT // BBMP SOUTH ZONE:
              </div>
              <p className="italic text-[11px] leading-relaxed">
                “When underground utilities are invisible, every road project is Russian Roulette. A 3D digital twin isn’t a visual gimmick—it is basic survival infrastructure for an 8-million tech megalopolis.”
              </p>
            </div>

            {/* Interactive Timeline Quick Scrubber */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>TIMELINE JUMP:</span>
                <span>CHAPTER {activeStory + 1} OF 3</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {STORIES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(idx)}
                    className={`py-1.5 px-2 text-[10px] font-mono font-bold uppercase border cursor-pointer truncate ${
                      activeStory === idx
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-slate-400 border-white/20 hover:border-white'
                    }`}
                  >
                    {idx === 0 ? 'Lakes' : idx === 1 ? 'Triple-Dig' : 'BDA Solar'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
