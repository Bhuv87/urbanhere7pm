import React from 'react';
import { useStore } from '../../store';
import { LayoutTransformMode } from '../../types/layout';

export const LayoutPalette: React.FC = () => {
  const {
    layoutItems,
    addLayoutItem,
    removeLayoutItem,
    clearLayoutItems,
    selectedLayoutItemId,
    setSelectedLayoutItemId,
    layoutTransformMode,
    setLayoutTransformMode,
  } = useStore();

  const paletteButtons = [
    { type: 'House', label: 'House', icon: '🏠', tag: 'BIM ARCH', bg: '#fef08a' },
    { type: 'Park', label: 'Park', icon: '🌳', tag: 'CIVIC GREEN', bg: '#bbf7d0' },
    { type: 'Road', label: 'Road', icon: '🛣️', tag: 'TRANSPORT', bg: '#e2e8f0' },
    { type: 'Water Pipe', label: 'Water Pipe', icon: '💧', tag: 'UTILITY 3D', bg: '#bae6fd' },
  ];

  const transformModes: { mode: LayoutTransformMode; label: string; shortcut: string }[] = [
    { mode: 'translate', label: 'Move', shortcut: 'W' },
    { mode: 'rotate', label: 'Rotate', shortcut: 'E' },
    { mode: 'scale', label: 'Scale', shortcut: 'R' },
  ];

  return (
    <div className="flex flex-col gap-3 font-mono text-xs select-none">
      {/* Module Title Header */}
      <div className="pb-2 border-b border-black">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] tracking-wider text-black uppercase">
            03 // LAYOUT BUILDER
          </span>
          <span className="text-[10px] bg-[#00ff66] text-black font-bold px-1.5 py-0.5 border border-black">
            CREATE
          </span>
        </div>
        <p className="text-[10px] text-[#555555] mt-0.5">
          Drag & drop items to design custom municipal layouts
        </p>
      </div>

      {/* Palette Buttons Grid */}
      <div>
        <div className="text-[10px] font-bold text-black uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>PALETTE OBJECTS</span>
          <span className="text-[#888888] font-normal">CLICK TO ADD</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {paletteButtons.map((btn) => (
            <button
              key={btn.type}
              onClick={() => addLayoutItem(btn.type)}
              className="border border-black bg-white hover:bg-[#fff9e6] p-2 hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex flex-col items-start gap-1 text-left transition-none"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-base">{btn.icon}</span>
                <span className="text-[8px] font-bold px-1 py-0.2 border border-black" style={{ backgroundColor: btn.bg }}>
                  {btn.tag}
                </span>
              </div>
              <span className="font-bold text-xs text-black uppercase">{btn.label}</span>
              <span className="text-[9px] text-[#666666]">Add to Grid (y=0)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Transform Gizmo Mode Controls */}
      <div className="pt-2 border-t border-black">
        <div className="text-[10px] font-bold text-black uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>GIZMO MODE</span>
          <span className="text-[#888888] font-normal">W / E / R</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {transformModes.map((tm) => {
            const isActive = layoutTransformMode === tm.mode;
            return (
              <button
                key={tm.mode}
                onClick={() => setLayoutTransformMode(tm.mode)}
                className={`border border-black py-1.5 px-1 font-bold text-center cursor-pointer uppercase text-[10px] transition-none ${
                  isActive
                    ? 'bg-black text-white hard-shadow-sm'
                    : 'bg-white text-black hover:bg-[#f0f0f0]'
                }`}
              >
                <span>{tm.label}</span>
                <span className="text-[8px] ml-1 opacity-70">[{tm.shortcut}]</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Placed Items Inspector */}
      <div className="pt-2 border-t border-black">
        <div className="text-[10px] font-bold text-black uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>PLACED ITEMS ({layoutItems.length})</span>
          {layoutItems.length > 0 && (
            <button
              onClick={clearLayoutItems}
              className="text-[9px] text-[#dc0000] hover:underline font-bold uppercase cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {layoutItems.length === 0 ? (
          <div className="p-3 border border-dashed border-[#888888] bg-[#f9f9f9] text-center text-[10px] text-[#777777]">
            No items placed yet. Click House, Park, Road, or Water Pipe above to add.
          </div>
        ) : (
          <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-0.5">
            {layoutItems.map((item, idx) => {
              const isSelected = selectedLayoutItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedLayoutItemId(item.id)}
                  className={`border border-black p-1.5 flex items-center justify-between cursor-pointer transition-none ${
                    isSelected
                      ? 'bg-[#fef08a] hard-shadow-sm font-bold'
                      : 'bg-white hover:bg-[#f7f7f7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-xs">
                      {item.type === 'House'
                        ? '🏠'
                        : item.type === 'Park'
                        ? '🌳'
                        : item.type === 'Road'
                        ? '🛣️'
                        : '💧'}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-black">
                        #{idx + 1} {item.type}
                      </span>
                      <span className="text-[8px] text-[#555555]">
                        ({item.position[0].toFixed(1)}, {item.position[1].toFixed(1)}, {item.position[2].toFixed(1)})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayoutItem(item.id);
                    }}
                    className="border border-black bg-white hover:bg-[#dc0000] hover:text-white px-1.5 py-0.5 text-[9px] font-bold cursor-pointer"
                    title="Delete item"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CAD Helper Tips */}
      <div className="border border-black bg-[#fff9e6] p-2 text-[9px] text-[#6b4700] flex flex-col gap-1">
        <div className="font-bold uppercase flex items-center gap-1">
          <span>ℹ BIM CONTROLS</span>
        </div>
        <p>• Click any item in the 3D scene to select it.</p>
        <p>• Drag the 3-axis gizmo on the flat grid.</p>
        <p>• Press [W] to move, [E] to rotate, [R] to scale.</p>
        <p>• Click empty grid space to deselect.</p>
      </div>
    </div>
  );
};
