import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useStore } from '../../store';
import { getStreet } from '../../dataHelpers';

export const CADBuilding: React.FC = () => {
  const {
    cadModel,
    cityId,
    areaId,
    streetId,
    cadRenderMode,
    toggleCADRenderMode,
    convertCADToPermanentHouse,
  } = useStore();

  // Safely construct BufferGeometry with error containment (HOOK MUST BE AT TOP UNCONDITIONALLY)
  const customGeo = useMemo(() => {
    try {
      if (!cadModel?.meshData?.positions || cadModel.meshData.positions.length < 9) {
        return null;
      }
      const geo = new THREE.BufferGeometry();
      const posAttr = new THREE.BufferAttribute(cadModel.meshData.positions, 3);
      geo.setAttribute('position', posAttr);

      if (cadModel.meshData.normals && cadModel.meshData.normals.length === cadModel.meshData.positions.length) {
        geo.setAttribute('normal', new THREE.BufferAttribute(cadModel.meshData.normals, 3));
      } else {
        geo.computeVertexNormals();
      }

      if (cadModel.meshData.indices && cadModel.meshData.indices.length > 0) {
        const maxVert = cadModel.meshData.positions.length / 3;
        let valid = true;
        for (let i = 0; i < Math.min(cadModel.meshData.indices.length, 500); i++) {
          if (cadModel.meshData.indices[i] >= maxVert) {
            valid = false;
            break;
          }
        }
        if (valid) {
          geo.setIndex(new THREE.BufferAttribute(cadModel.meshData.indices, 1));
        }
      }
      return geo;
    } catch (e) {
      console.warn('CADBuilding geometry creation fallback:', e);
      return null;
    }
  }, [cadModel?.meshData]);

  // Early return strictly AFTER all hooks
  if (!cadModel) return null;

  const street = getStreet(cityId, areaId, streetId);
  const plotCenter = street.emptyPlotCenter || [20, 0, -18];

  const height = Math.max(3.0, cadModel.bbox.max[1] - cadModel.bbox.min[1]);
  const width = Math.max(3.0, cadModel.bbox.max[0] - cadModel.bbox.min[0]);
  const depth = Math.max(3.0, cadModel.bbox.max[2] - cadModel.bbox.min[2]);

  const isNormalMode = cadRenderMode === 'normal';

  return (
    <group position={plotCenter}>
      {/* 1. MESH BODY */}
      {customGeo ? (
        <group>
          {/* Main Solid Body */}
          <mesh geometry={customGeo} castShadow receiveShadow>
            {isNormalMode ? (
              // Realistic Normal Architectural Material
              <meshStandardMaterial
                color="#f8fafc"
                roughness={0.7}
                metalness={0.12}
              />
            ) : (
              // CAD Blueprint Hologram Material
              <meshStandardMaterial
                color="#38bdf8"
                roughness={0.25}
                metalness={0.75}
                transparent
                opacity={0.88}
              />
            )}
          </mesh>

          {/* Architectural Trim / Wireframe */}
          {isNormalMode ? (
            <mesh geometry={customGeo}>
              <meshBasicMaterial color="#334155" wireframe transparent opacity={0.35} />
            </mesh>
          ) : (
            <mesh geometry={customGeo}>
              <meshBasicMaterial color="#0284c7" wireframe />
            </mesh>
          )}

          {/* Realistic Foundation Concrete Plinth in Normal Mode */}
          {isNormalMode && (
            <mesh position={[0, 0.12, 0]} receiveShadow>
              <boxGeometry args={[width + 0.8, 0.24, depth + 0.8]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.8} />
            </mesh>
          )}
        </group>
      ) : (
        <group>
          {/* CAD Building Core Volume */}
          <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={isNormalMode ? '#f1f5f9' : '#38bdf8'}
              roughness={isNormalMode ? 0.7 : 0.2}
              metalness={isNormalMode ? 0.1 : 0.8}
              transparent={!isNormalMode}
              opacity={isNormalMode ? 1.0 : 0.85}
            />
          </mesh>

          {/* Structural Wireframe Overlay */}
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.1, height + 0.1, depth + 0.1]} />
            <meshBasicMaterial
              color={isNormalMode ? '#334155' : '#0284c7'}
              wireframe
              transparent={isNormalMode}
              opacity={isNormalMode ? 0.4 : 1.0}
            />
          </mesh>
        </group>
      )}

      {/* 2. FLOATING IN-SCENE ACTION BAR (Directly above the house) */}
      <Html position={[0, height + 1.8, 0]} center distanceFactor={25}>
        <div className="bg-white/95 border-2 border-black p-2 hard-shadow font-mono text-black select-none pointer-events-auto min-w-[240px]">
          <div className="flex items-center justify-between pb-1 border-b border-black mb-1.5 text-[10px]">
            <span className="font-bold uppercase truncate max-w-[140px] text-black">
              📁 {cadModel.filename}
            </span>
            <span
              className={`px-1 font-bold text-[9px] ${
                isNormalMode ? 'bg-[#15803d] text-white' : 'bg-[#0284c7] text-white'
              }`}
            >
              {isNormalMode ? 'NORMAL REALISTIC' : 'BLUEPRINT CAD'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={convertCADToPermanentHouse}
              className="bg-[#dc0000] hover:bg-[#b91c1c] text-white border border-black py-1 px-1 font-bold text-[9px] uppercase cursor-pointer"
            >
              📌 FIX AS HOUSE
            </button>
            <button
              onClick={toggleCADRenderMode}
              className="bg-[#f0f0f0] hover:bg-[#e4e4e4] text-black border border-black py-1 px-1 font-bold text-[9px] uppercase cursor-pointer"
            >
              {isNormalMode ? '🎨 BLUEPRINT' : '🏛️ NORMAL'}
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
};
