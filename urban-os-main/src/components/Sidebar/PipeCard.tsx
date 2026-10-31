import React from 'react';
import { useStore } from '../../store';
import { flyToTopDown, flyTo3D } from '../../utils/cameraUtils';

interface PipeCardProps {
  type: 'water' | 'gas' | 'fiber' | 'power';
  name: string;
  agency: string;
  color: string;
  diameter: number;
  depth: number;
}

export const PipeCard: React.FC<PipeCardProps> = ({
  type,
  name,
  agency,
  color,
  diameter,
  depth,
}) => {
  const { armedTool, armTool, startPipeRun, currentPipeDepth, setCurrentPipeDepth, draftPipeRun } =
    useStore();

  const isArmed = armedTool.type === 'pipe' && armedTool.subType === type;
  const isDrafting = isArmed && draftPipeRun !== null;

  const handleDrawRun = () => {
    if (isArmed && armedTool.mode === 'draw') {
      useStore.getState().disarmTool();
      flyTo3D();
    } else {
      startPipeRun(type, 'draw');
      flyToTopDown();
    }
  };

  const handleDropVertical = () => {
    if (isArmed && armedTool.mode === 'vertical') {
      useStore.getState().disarmTool();
      flyTo3D();
    } else {
      startPipeRun(type, 'vertical');
      flyToTopDown();
    }
  };

  return (
    <div
      className={`border border-black p-2 bg-white transition-none mb-2 ${
        isArmed ? 'border-[#dc0000] hard-shadow-red bg-[#fffaf5]' : 'hard-shadow-sm'
      }`}
    >
      {/* Header with swatch */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <div
            className="w-3.5 h-3.5 border border-black"
            style={{ backgroundColor: color }}
          ></div>
          <span className="font-bold text-xs tracking-wider uppercase font-mono">
            {name}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#666666] uppercase">{agency}</span>
      </div>

      {/* Specifications */}
      <div className="flex items-center justify-between py-1.5 font-mono text-[11px] text-[#333333]">
        <span>Ø {diameter.toFixed(2)}m</span>
        <span className="font-bold text-[#000000]">-{depth.toFixed(1)}m DEPTH</span>
      </div>

      {/* Depth slider if drafting this type */}
      {isDrafting && (
        <div className="my-1.5 p-1.5 bg-[#f0f0f0] border border-black font-mono text-[10px]">
          <div className="flex justify-between font-bold mb-1">
            <span>WP DEPTH:</span>
            <span>-{currentPipeDepth.toFixed(1)}m</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.1"
            value={currentPipeDepth}
            onChange={(e) => setCurrentPipeDepth(parseFloat(e.target.value))}
            className="w-full h-1 bg-black accent-[#dc0000] cursor-pointer"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <button
          onClick={handleDrawRun}
          className={`border border-black py-1 px-1 font-mono text-[10px] font-bold uppercase cursor-pointer active:translate-x-[1px] active:translate-y-[1px] ${
            isArmed && armedTool.mode === 'draw'
              ? 'bg-[#dc0000] text-white'
              : 'bg-[#f4f4f4] hover:bg-[#e8e8e8] text-black'
          }`}
        >
          {isArmed && armedTool.mode === 'draw' ? 'Active [Esc]' : 'Draw Run'}
        </button>

        <button
          onClick={handleDropVertical}
          className={`border border-black py-1 px-1 font-mono text-[10px] font-bold uppercase cursor-pointer active:translate-x-[1px] active:translate-y-[1px] ${
            isArmed && armedTool.mode === 'vertical'
              ? 'bg-[#dc0000] text-white'
              : 'bg-[#f4f4f4] hover:bg-[#e8e8e8] text-black'
          }`}
        >
          {isArmed && armedTool.mode === 'vertical' ? 'Active [Esc]' : 'Vertical'}
        </button>
      </div>
    </div>
  );
};
