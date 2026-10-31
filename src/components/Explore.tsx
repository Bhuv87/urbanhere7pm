import React, { useEffect, useState } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { Scene } from './Scene';
import { ZoningHUD } from './Scene/ZoningHUD';
import { HouseTransformInspector } from './Scene/HouseTransformInspector';
import { ChatAgent } from './ChatAgent';
import { DraftPetitionModal } from './Scene/DraftPetitionModal';
import { useStore } from '../store';

export const Explore: React.FC = () => {
  const [showClashAlert, setShowClashAlert] = useState(false);
  const {
    armedTool,
    disarmTool,
    commitPipeRun,
    draftPipeRun,
    selectedObjectId,
    removeHouse,
    removePipeRun,
    setSelectedObjectId,
    streetId,
    toast,
    setToast,
    rotateGhost,
    newHouses,
    updateHouseTransform,
    clashes,
    pendingAgentPlacement,
  } = useStore();

  useEffect(() => {
    if (clashes.length === 0) {
      setShowClashAlert(false);
      return;
    }
    setShowClashAlert(true);
    const timer = window.setTimeout(() => setShowClashAlert(false), 5000);
    return () => window.clearTimeout(timer);
  }, [clashes.length]);

  // Global keyboard shortcuts (Esc, Enter, Delete, R/X/Z rotation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key === 'Escape') {
        disarmTool();
        setSelectedObjectId(null);
        setToast('Tool cancelled [ESC]');
      } else if (e.key === 'Enter') {
        if (armedTool.type === 'pipe' && draftPipeRun && draftPipeRun.waypoints.length >= 2) {
          commitPipeRun();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId) {
          if (selectedObjectId.startsWith('house-')) {
            removeHouse(streetId, selectedObjectId);
          } else if (selectedObjectId.startsWith('pipe-')) {
            removePipeRun(streetId, selectedObjectId);
          }
          setSelectedObjectId(null);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        // Rotate Heading / Yaw
        if (armedTool.type === 'house') {
          rotateGhost('y', e.shiftKey ? -45 : 45);
          setToast('Rotated preview 45° [R]');
        } else if (selectedObjectId && selectedObjectId.startsWith('house-')) {
          const house = (newHouses[streetId] || []).find((h) => h.id === selectedObjectId);
          if (house) {
            const rot3D = house.rotation3D || [0, Math.round(((house.rotation || 0) * 180) / Math.PI), 0];
            const nextY = (rot3D[1] + (e.shiftKey ? -15 : 15) + 360) % 360;
            updateHouseTransform(streetId, house.id, {
              rotation3D: [rot3D[0], nextY, rot3D[2]],
            });
            setToast(`Rotated house yaw: ${nextY}° [R]`);
          }
        }
      } else if (e.key === 'x' || e.key === 'X') {
        // Rotate Slope / Pitch
        if (armedTool.type === 'house') {
          rotateGhost('x', e.shiftKey ? -5 : 5);
        } else if (selectedObjectId && selectedObjectId.startsWith('house-')) {
          const house = (newHouses[streetId] || []).find((h) => h.id === selectedObjectId);
          if (house) {
            const rot3D = house.rotation3D || [0, Math.round(((house.rotation || 0) * 180) / Math.PI), 0];
            const nextX = (rot3D[0] + (e.shiftKey ? -5 : 5));
            updateHouseTransform(streetId, house.id, {
              rotation3D: [nextX, rot3D[1], rot3D[2]],
            });
            setToast(`Rotated house pitch: ${nextX}° [X]`);
          }
        }
      } else if (e.key === 'z' || e.key === 'Z') {
        // Rotate Bank / Roll
        if (armedTool.type === 'house') {
          rotateGhost('z', e.shiftKey ? -5 : 5);
        } else if (selectedObjectId && selectedObjectId.startsWith('house-')) {
          const house = (newHouses[streetId] || []).find((h) => h.id === selectedObjectId);
          if (house) {
            const rot3D = house.rotation3D || [0, Math.round(((house.rotation || 0) * 180) / Math.PI), 0];
            const nextZ = (rot3D[2] + (e.shiftKey ? -5 : 5));
            updateHouseTransform(streetId, house.id, {
              rotation3D: [rot3D[0], rot3D[1], nextZ],
            });
            setToast(`Rotated house roll: ${nextZ}° [Z]`);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    armedTool,
    draftPipeRun,
    selectedObjectId,
    streetId,
    disarmTool,
    commitPipeRun,
    removeHouse,
    removePipeRun,
    setSelectedObjectId,
    setToast,
  ]);

  // Toast auto-clear
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, setToast]);

  return (
    <div className="w-screen h-screen flex flex-col bg-white overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Main Workspace (Sidebar + 3D Viewport) */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />

        {/* 3D Scene Container */}
        <main className="flex-1 relative h-full">
          <Scene />

          {/* Municipal Zoning HUD Overlay */}
          <ZoningHUD />

          {/* Selected House 3D Rotation & Transform Inspector */}
          <HouseTransformInspector />

          {/* Autonomous AI Command Center Agent */}
          <ChatAgent />
          <DraftPetitionModal />
          {showClashAlert && (
            <div role="alert" className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-white text-[#dc0000] border border-black px-3 py-2 font-mono text-xs font-bold shadow-[3px_3px_0_0_#000]">
              ⚠ {clashes.length} CLASHES DETECTED. Click SCAN to resolve.
            </div>
          )}
          {pendingAgentPlacement && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-white text-black border border-black px-3 py-2 font-mono text-xs font-bold shadow-[3px_3px_0_0_#000]">
              {pendingAgentPlacement.count} {pendingAgentPlacement.type} houses ready · Click the map to set the origin
            </div>
          )}

          {/* Technical Toast Notifications */}
          {toast && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white border border-white px-3 py-1.5 font-mono text-xs hard-shadow z-40 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#dc0000]"></span>
              <span>{toast}</span>
            </div>
          )}

          {/* Active Tool Help Bar */}
          {armedTool.type && (
            <div className="absolute top-3 left-4 bg-white/95 border border-black px-3 py-1 font-mono text-xs hard-shadow-sm z-30 flex items-center gap-2 text-black">
              <span className="font-bold text-[#dc0000] uppercase">
                {armedTool.type === 'house'
                  ? `[HOUSE TOOL: ${armedTool.subType?.toUpperCase()}]`
                  : `[PIPE TOOL: ${armedTool.subType?.toUpperCase()} (${armedTool.mode?.toUpperCase()})]`}
              </span>
              <span className="text-[#555555]">
                {armedTool.type === 'house'
                  ? 'Click plot to place · ESC to cancel'
                  : 'Click waypoints · Enter/DblClick to commit · ESC to cancel'}
              </span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
