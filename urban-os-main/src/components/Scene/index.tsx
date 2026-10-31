import React, { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useStore } from '../../store';
import { getArea, getStreet } from '../../dataHelpers';
import { Ground } from './Ground';
import { SunLight } from './SunLight';
import { Street } from './Street';
import { CameraController } from './CameraController';
import { isSoftwareGl } from '../../utils/softwareGl';
import { ScanPanel } from './ScanPanel';
import { RerouteHUD } from './RerouteHUD';

// Invalidator to trigger on-demand frame rendering when state changes
const Invalidator: React.FC = () => {
  const { invalidate } = useThree();
  const { exploded, streetId, viewMode, solarTime, cadModel, newHouses, newPipeRuns, showUtilities, pipelineFocusMode } = useStore();

  useEffect(() => {
    invalidate();
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 400);
    const t3 = setTimeout(invalidate, 800);
    const t4 = setTimeout(invalidate, 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [exploded, streetId, viewMode, solarTime, cadModel, newHouses, newPipeRuns, showUtilities, pipelineFocusMode, invalidate]);

  return null;
};

export const Scene: React.FC = () => {
  const { cityId, areaId, streetId, viewMode, showUtilities, pipelineFocusMode, pendingAgentPlacement, placeAgentHouses } = useStore();
  const [cursorPoint, setCursorPoint] = useState<[number, number, number] | null>(null);
  const [agentOrigin, setAgentOrigin] = useState<[number, number] | null>(null);

  const currentArea = getArea(cityId, areaId);
  const currentStreet = getStreet(cityId, areaId, streetId);

  useEffect(() => {
    if (!agentOrigin || !pendingAgentPlacement) return;
    placeAgentHouses(streetId, [
      agentOrigin[0] - currentStreet.origin[0],
      agentOrigin[1] - currentStreet.origin[2],
    ]);
    setAgentOrigin(null);
  }, [agentOrigin, pendingAgentPlacement, placeAgentHouses, streetId, currentStreet]);

  return (
    <div className={`w-full h-full relative select-none ${pipelineFocusMode ? 'bg-[#dce4ea]' : 'bg-[#1a1e24]'}`}>
      {/* 2D BIM Clash & Reroute HUD Overlays */}
      <ScanPanel />
      <RerouteHUD />
      {pipelineFocusMode && (
        <div className="absolute bottom-4 left-4 z-30 bg-white text-black border border-black shadow-[3px_3px_0_0_#000] px-3 py-2 font-mono text-[10px] font-bold">
          PIPE NETWORK // Hover connection nodes to trace each house to its main.
        </div>
      )}

      <Canvas
        gl={{ preserveDrawingBuffer: true, antialias: !isSoftwareGl, powerPreference: 'high-performance' }}
        camera={{ position: [35, 40, 55], fov: 45 }}
        dpr={isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)}
        frameloop={isSoftwareGl ? 'demand' : 'always'}
        shadows={!isSoftwareGl}
        className="w-full h-full cursor-crosshair"
      >
        <Invalidator />
        <CameraController />
        <SunLight />
        <Environment preset="city" environmentIntensity={0.6} />

        {/* Global Ground Plane */}
        <Ground onPointerMoveGround={setCursorPoint} onAgentOrigin={setAgentOrigin} />

        {/* Ground grid lines for CAD reference */}
        {!pipelineFocusMode && <gridHelper
          args={[600, 300, '#444444', '#282d35']}
          position={[0, 0.01, 0]}
        />}

        {/* Render Streets */}
        {viewMode === 'area' ? (
          currentArea.streets.map((s) => {
            const isFocused = s.id === currentStreet.id;
            return (
              <group key={s.id}>
                {isFocused ? (
                  <Street
                    street={s}
                    isFocused={true}
                    showUtilities={showUtilities}
                    pipelineFocusMode={pipelineFocusMode}
                    cursorPoint={cursorPoint}
                  />
                ) : (
                  <group>
                    <Street
                      street={s}
                      isFocused={false}
                      showUtilities={showUtilities}
                      pipelineFocusMode={pipelineFocusMode}
                      cursorPoint={null}
                    />
                  </group>
                )}
              </group>
            );
          })
        ) : (
          <Street
            street={currentStreet}
            isFocused={true}
            showUtilities={showUtilities}
            pipelineFocusMode={pipelineFocusMode}
            cursorPoint={cursorPoint}
          />
        )}

        {/* Soft Contact Ground Shadows */}
        {!isSoftwareGl && !pipelineFocusMode && (
          <ContactShadows
            position={[0, 0.02, 0]}
            opacity={0.4}
            scale={200}
            blur={1.5}
            far={15}
          />
        )}

        {/* CAD Coordinate Orientation Gizmo */}
        <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
          <GizmoViewport
            axisColors={['#dc0000', '#00cc66', '#00aaff']}
            labelColor="#ffffff"
          />
        </GizmoHelper>
      </Canvas>
    </div>
  );
};
