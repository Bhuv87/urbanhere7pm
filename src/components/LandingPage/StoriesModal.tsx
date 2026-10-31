import React, { useState } from 'react';
import { audioFX } from './AudioFX';

interface StoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORIES = [
  {
    id: 'lakes',
    era: '1537 CE — 1960s',
    title: 'KEMPE GOWDA’S LABYRINTH & THE 1,000 LOST LAKES',
    kannadaSubtitle: 'ಕೆಂಪೇಗೌಡರ ಕಲ್ಯಾಣಿಗಳು ಮತ್ತು ಕಣ್ಮರೆಯಾದ ಕೆರೆಗಳು',
    history:
      'In 1537, Nadaprabhu Kempe Gowda established Bengaluru on a semi-arid Deccan plateau with no perennial river. Ancient hydraulic planners engineered an interconnected cascade of over 1,000 lakes (keres) and stepwells (kalyanis) linked by subterranean natural canals (raja kaluves).',
    problem:
      'As Bengaluru boomed into India’s Silicon Valley, 86% of lakes were paved over. High-density structures were built directly over unmapped subterranean channels. Without 3D depth records, civil construction routinely punctures natural drainage veins, causing urban flash floods.',
    solution:
      'The Digital Twin models subterranean depths from 0m down to bedrock (-5.0m), giving engineers unified 3D spatial visibility.',
  },
  {
    id: 'triple-dig',
    era: '2000s — PRESENT',
    title: 'THE "TRIPLE-DIG" WAR: BWSSB vs BESCOM vs GAIL vs OFC',
    kannadaSubtitle: 'ರಸ್ತೆ ಅಗೆಯುವ ಅವಾಂತರ: ನಾಲ್ಕು ಇಲಾಖೆಗಳ ಸಮರ',
    history:
      'Every Bengalurean knows the cycle: BBMP paves a road in Uttarahalli or Kanakapura. Two weeks later, BWSSB trenches it for Cauvery water pipes. Months later, GAIL digs for city gas. Soon after, telecom operators send JCBs to trench optic fiber.',
    problem:
      'In South Bengaluru, an unmapped JCB trenching operation sliced through an 11kV BESCOM power cable and a 600mm BWSSB water line simultaneously. Over 45,000 households were left without water and power for 4 days, causing ₹18 Crores in damages.',
    solution:
      'Our sub-millimeter 3D spatial clash detection alerts routing engineers the instant a proposed gas, power, or water lateral violates the mandatory 0.3m safety clearance threshold.',
  },
  {
    id: 'bda-solar',
    era: 'MODERN RESIDENTIAL',
    title: 'THE 30x40 BDA PLOT & THE VANISHING ROOFTOP SUN',
    kannadaSubtitle: 'ಬಿಡಿಎ ನಿವೇಶನ ಮತ್ತು ಮಾಯವಾಗುತ್ತಿರುವ ಬಿಸಿಲು',
    history:
      'For decades, Bengaluru’s middle-class dream was built on standard BDA sites: 20x30 FT (600 sqft), 30x40 FT (1,200 sqft), and 40x60 FT (2,400 sqft), pioneering rooftop solar water heaters and solar panels.',
    problem:
      'Rapid, unapproved G+4 commercial towers sprouted on narrow residential roads with zero setback (violating the mandatory BBMP 3.0m perimeter buffer), casting deep shadows over neighboring rooftops and cutting solar efficiency by up to 74%.',
    solution:
      'Integrated SunCalc ephemeris calculates sun position for Bengaluru (12.9716° N) at any hour, raycasting building shadows onto rooftop solar panel arrays to calculate efficiency loss in real time.',
  },
];

export const StoriesModal: React.FC<StoriesModalProps> = ({ isOpen, onClose }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!isOpen) return null;

  const story = STORIES[activeIdx];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 select-none font-mono">
      <div className="bg-[#141822] border-2 border-black hard-shadow w-full max-w-2xl text-white p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/20 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#dc0000] inline-block" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              BENGALURU HISTORIC CHRONICLES &amp; URBAN CRISIS
            </h3>
          </div>
          <button
            onClick={() => {
              audioFX.playClick();
              onClose();
            }}
            className="text-xs font-bold text-slate-400 hover:text-white px-2 py-0.5 border border-white/20 hover:border-white cursor-pointer"
          >
            ✕ CLOSE [ESC]
          </button>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-3 gap-1 bg-black p-1 border border-white/20 text-xs font-bold mb-5">
          {STORIES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveIdx(idx);
                audioFX.playClick();
              }}
              className={`py-2 text-center uppercase cursor-pointer truncate px-1 text-[11px] ${
                activeIdx === idx ? 'bg-[#dc0000] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              0{idx + 1}. {idx === 0 ? '1,000 Lakes' : idx === 1 ? 'Triple-Dig' : '30x40 Solar'}
            </button>
          ))}
        </div>

        {/* Story content */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] bg-white/10 text-[#00aaff] px-2 py-0.5 border border-[#00aaff]/40 uppercase font-bold">
              ERA: {story.era}
            </span>
            <h4 className="text-lg font-black uppercase text-white mt-2 leading-tight">
              {story.title}
            </h4>
            <div className="text-xs text-amber-400 font-serif mt-0.5">
              {story.kannadaSubtitle}
            </div>
          </div>

          <div className="bg-black/40 border border-white/15 p-3 text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-white block font-mono text-[11px] uppercase mb-1">
              Historical Foundation:
            </strong>
            {story.history}
          </div>

          <div className="bg-[#201010] border-l-4 border-[#dc0000] p-3 text-xs text-red-200 leading-relaxed font-mono">
            <strong className="text-[#dc0000] block uppercase mb-1">
              ⚠️ The Subterranean Crisis (The Problem):
            </strong>
            {story.problem}
          </div>

          <div className="bg-[#0b1d28] border-l-4 border-[#00aaff] p-3 text-xs text-cyan-200 leading-relaxed font-mono">
            <strong className="text-[#00aaff] block uppercase mb-1">
              ⚡ How Bengaluru Digital Twin Solves It:
            </strong>
            {story.solution}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/15 flex justify-between items-center text-[10px] text-slate-400">
          <span>BBMP South Zone · Urban Planning Case Study</span>
          <button
            onClick={() => {
              audioFX.playClick();
              onClose();
            }}
            className="bg-white text-black font-bold uppercase px-4 py-1.5 hover:bg-slate-200 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
