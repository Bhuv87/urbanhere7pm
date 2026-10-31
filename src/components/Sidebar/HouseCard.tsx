import React from 'react';
import { useStore } from '../../store';
import { HouseModelVariant } from '../../data/houseModels';
import { flyToTopDown, flyTo3D } from '../../utils/cameraUtils';

interface HouseCardProps {
  category: '20x30' | '30x40' | '40x60';
  dimensions: string;
  sqft: number;
  floors: string;
  defaultDescription: string;
}

export const HouseCard: React.FC<HouseCardProps> = ({
  category,
  dimensions,
  sqft,
  floors,
  defaultDescription,
}) => {
  const {
    armedTool,
    armTool,
    disarmTool,
    houseModels,
    selectedHouseModelId,
    selectHouseModel,
    expandedPlotCategory,
    setExpandedPlotCategory,
    setCADGuideOpen,
    setToast,
  } = useStore();

  const isCategoryExpanded = expandedPlotCategory === category;
  const isCategoryArmed = armedTool.type === 'house' && armedTool.subType === category;

  // Filter models for this category
  const models = houseModels.filter((m) => m.category === category);
  const activeModel = houseModels.find((m) => m.id === selectedHouseModelId);

  const handleToggleCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCategoryExpanded) {
      setExpandedPlotCategory(null);
    } else {
      setExpandedPlotCategory(category);
      // Automatically select first model of this category if none in category is selected
      if (!activeModel || activeModel.category !== category) {
        if (models[0]) {
          selectHouseModel(models[0].id);
        }
      }
    }
  };

  const handleArmCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCategoryArmed) {
      disarmTool();
      flyTo3D();
      setToast('House placement disarmed');
    } else {
      setExpandedPlotCategory(category);
      const targetModel = models.find((m) => m.id === selectedHouseModelId) || models[0];
      if (targetModel) {
        selectHouseModel(targetModel.id);
      } else {
        armTool({ type: 'house', subType: category });
      }
      flyToTopDown();
    }
  };

  const handleDragStart = (e: React.DragEvent, model: HouseModelVariant) => {
    e.dataTransfer.setData('text/plain', category);
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ houseType: category, modelId: model.id })
    );
    selectHouseModel(model.id);
  };

  return (
    <div
      className={`border border-black bg-white transition-none mb-2 select-none ${
        isCategoryArmed ? 'border-[#dc0000] hard-shadow-red bg-[#fffaf5]' : 'hard-shadow-sm'
      }`}
    >
      {/* Category Header Card */}
      <div
        onClick={handleToggleCategory}
        className="p-2 cursor-pointer hover:bg-[#fafafa] flex flex-col"
      >
        <div className="flex items-center justify-between pb-1 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs tracking-wider uppercase font-mono">
              {dimensions} FT
            </span>
            <span className="text-[10px] font-mono bg-black text-white px-1 font-bold">
              {models.length} MODELS
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono font-bold bg-[#f0f0f0] border border-[#d0d0d0] px-1">
              {floors}
            </span>
            <span className="font-mono text-xs font-bold text-[#666666]">
              {isCategoryExpanded ? '▲' : '▼'}
            </span>
          </div>
        </div>

        <div className="py-1 font-mono text-[11px] text-[#444444] flex justify-between items-center">
          <span>{sqft} SQFT</span>
          <span className="text-[10px] text-[#888888]">{defaultDescription}</span>
        </div>

        <div className="mt-1 pt-1 border-t border-[#f0f0f0] flex items-center justify-between font-mono text-[10px]">
          <span className="text-[#666666]">
            {isCategoryExpanded ? 'CHOOSE MODEL BELOW:' : 'CLICK TO EXPAND MODELS'}
          </span>
          <button
            onClick={handleArmCategory}
            className={`px-1.5 py-0.5 border font-bold uppercase cursor-pointer ${
              isCategoryArmed
                ? 'bg-[#dc0000] text-white border-black'
                : 'bg-[#f4f4f4] hover:bg-[#e0e0e0] border-black text-black'
            }`}
          >
            {isCategoryArmed ? 'ARMED [ESC]' : '+ ARM'}
          </button>
        </div>
      </div>

      {/* Expanded Models List */}
      {isCategoryExpanded && (
        <div className="border-t-2 border-black bg-[#f4f4f4] p-2 space-y-2">
          <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#333333] pb-1 border-b border-[#dddddd]">
            <span>SELECT {dimensions} HOUSE ARCHITECTURE:</span>
            <button
              onClick={() => setCADGuideOpen(true)}
              className="text-[#dc0000] hover:underline cursor-pointer"
            >
              + UPLOAD CAD
            </button>
          </div>

          {models.map((m) => {
            const isModelSelected = selectedHouseModelId === m.id && isCategoryArmed;
            return (
              <div
                key={m.id}
                draggable
                onDragStart={(e) => handleDragStart(e, m)}
                onClick={() => selectHouseModel(m.id)}
                className={`p-2 border transition-none cursor-pointer ${
                  isModelSelected
                    ? 'border-[#dc0000] bg-white hard-shadow-red ring-1 ring-[#dc0000]'
                    : 'border-black bg-white hover:bg-[#fafafa] hard-shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🏠</span>
                    <span className="font-mono text-xs font-bold text-black uppercase">
                      {m.name}
                    </span>
                  </div>
                  {m.isCustom ? (
                    <span className="font-mono text-[9px] bg-[#dc0000] text-white px-1 font-bold">
                      CUSTOM CAD
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] bg-[#eeeeee] border border-[#cccccc] px-1 text-[#444]">
                      {m.subtitle}
                    </span>
                  )}
                </div>

                <p className="font-mono text-[10px] text-[#555555] my-1 leading-tight">
                  {m.description}
                </p>

                {/* Features Badges */}
                <div className="flex flex-wrap gap-1 my-1">
                  {m.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-[9px] bg-[#f0f0f0] border border-[#e0e0e0] px-1 text-[#333333]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>

                {/* Selection and Arm Button */}
                <div className="mt-1.5 pt-1 border-t border-[#f0f0f0] flex justify-between items-center font-mono text-[10px]">
                  <span className="text-[#777777]">
                    {m.footprint[0]}m × {m.footprint[1]}m · {m.height}m H
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectHouseModel(m.id);
                    }}
                    className={`px-2 py-0.5 border uppercase font-bold cursor-pointer ${
                      isModelSelected
                        ? 'bg-[#dc0000] text-white border-black'
                        : 'bg-[#eeeeee] hover:bg-[#e0e0e0] border-black text-black'
                    }`}
                  >
                    {isModelSelected ? '✓ ARMED (PLACE ON PLOT)' : 'SELECT MODEL'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Quick upload button inside catalog */}
          <button
            onClick={() => setCADGuideOpen(true)}
            className="w-full border border-dashed border-black bg-white hover:bg-[#fff9e6] py-1.5 font-mono text-[10px] font-bold uppercase text-black cursor-pointer flex items-center justify-center gap-1"
          >
            <span>+ Upload My Custom CAD House (.STEP / .STL / .OBJ / .GLTF)</span>
          </button>
        </div>
      )}
    </div>
  );
};
