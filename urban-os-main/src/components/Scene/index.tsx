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
import { CustomAreaLayout } from './CustomAreaLayout';

// Invalidator to trigger on-demand frame rendering when state changes
const Invalidator: React.FC = () => {
  const { invalidate } = useThree();
  const {
    exploded,
    streetId,
    viewMode,
    solarTime,
    cadModel,
    newHouses,
    newPipeRuns,
    layoutMode,
    layoutItems,
  } = useStore();

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
  }, [
    exploded,
    streetId,
    viewMode,
    solarTime,
    cadModel,
    newHouses,
    newPipeRuns,
    layoutMode,
    layoutItems,
    invalidate,
  ]);

  return null;
};

export const Scene: React.FC = () => {
  const { cityId, areaId, streetId, viewMode, layoutMode, setSelectedLayoutItemId } = useStore();
  const [cursorPoint, setCursorPoint] = useState<[number, number, number] | null>(null);

  const currentArea = getArea(cityId, areaId);
  const currentStreet = getStreet(cityId, areaId, streetId);

  return (
    <div className="w-full h-full relative bg-[#1a1e24] select-none">
      {/* 2D BIM Clash & Reroute HUD Overlays (only in explore mode) */}
      {layoutMode !== 'create' && (
        <>
          <ScanPanel />
          <RerouteHUD />
        </>
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

        {layoutMode === 'create' ? (
          /* CREATE MODE: Flat grid at y=0, terrain and existing buildings hidden */
          <>
            <gridHelper
              args={[240, 120, '#00ff66', '#334155']}
              position={[0, 0, 0]}
            />
            <gridHelper
              args={[240, 24, '#00aaff', '#1e293b']}
              position={[0, 0.005, 0]}
            />
            {/* Click-away catcher plane at y=0 to deselect */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.01, 0]}
              onClick={() => setSelectedLayoutItemId(null)}
            >
              <planeGeometry args={[500, 500]} />
              <meshBasicMaterial color="#14181f" depthWrite={false} />
            </mesh>
          </>
        ) : (
          /* EXPLORE MODE: Full ground terrain and existing street infrastructure */
          <>
            <Ground onPointerMoveGround={setCursorPoint} />
            <gridHelper
              args={[600, 300, '#444444', '#282d35']}
              position={[0, 0.01, 0]}
            />

            {viewMode === 'area' ? (
              currentArea.streets.map((s) => {
                const isFocused = s.id === currentStreet.id;
                return (
                  <group key={s.id}>
                    <Street
                      street={s}
                      isFocused={isFocused}
                      cursorPoint={isFocused ? cursorPoint : null}
                    />
                  </group>
                );
              })
            ) : (
              <Street
                street={currentStreet}
                isFocused={true}
                cursorPoint={cursorPoint}
              />
            )}
          </>
        )}

        {/* Custom Area Layout Items (rendered in both Explore and Create modes) */}
        <CustomAreaLayout />

        {/* Soft Contact Ground Shadows */}
        {!isSoftwareGl && (
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
