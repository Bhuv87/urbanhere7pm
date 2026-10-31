import React, { useMemo } from 'react';
import * as THREE from 'three';
import { HouseModelVariant } from '../../data/houseModels';

interface HouseArchitectureProps {
  model: HouseModelVariant;
  isSelected?: boolean;
}

export const HouseArchitecture: React.FC<HouseArchitectureProps> = ({ model, isSelected = false }) => {
  const [width, depth] = model.footprint;
  const height = model.height;
  const style = model.style;

  // Custom uploaded CAD geometry
  const customGeo = useMemo(() => {
    try {
      if (!model.meshPositions || model.meshPositions.length < 9) return null;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(model.meshPositions, 3));
      if (model.meshNormals && model.meshNormals.length === model.meshPositions.length) {
        geo.setAttribute('normal', new THREE.BufferAttribute(model.meshNormals, 3));
      } else {
        geo.computeVertexNormals();
      }
      if (model.meshIndices && model.meshIndices.length > 0) {
        const maxVert = model.meshPositions.length / 3;
        let valid = true;
        for (let i = 0; i < Math.min(model.meshIndices.length, 500); i++) {
          if (model.meshIndices[i] >= maxVert) {
            valid = false;
            break;
          }
        }
        if (valid) {
          geo.setIndex(new THREE.BufferAttribute(model.meshIndices, 1));
        }
      }
      return geo;
    } catch (e) {
      console.warn('House custom CAD geometry creation fallback:', e);
      return null;
    }
  }, [model.meshPositions, model.meshNormals, model.meshIndices]);

  if (customGeo) {
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}
        <mesh geometry={customGeo} castShadow receiveShadow>
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.68}
            metalness={0.12}
          />
        </mesh>
        <mesh geometry={customGeo}>
          <meshBasicMaterial color="#334155" wireframe transparent opacity={0.3} />
        </mesh>
        {/* Concrete Foundation Plinth */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[width + 0.6, 0.2, depth + 0.6]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // --- 1. MODERN DUPLEX (Bengaluru Nilaya) ---
  if (style === 'modern-duplex') {
    const mainBodyH = height - 0.8;
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Main Building Body */}
        <mesh position={[0, mainBodyH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, mainBodyH, depth]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Ground Floor Entrance Portico / Canopy */}
        <mesh position={[0, 2.5, depth / 2 + 0.8]} castShadow>
          <boxGeometry args={[2.6, 0.2, 1.6]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* Portico Support Pillar */}
        <mesh position={[1.1, 1.2, depth / 2 + 1.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.4, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Ground Entrance Door */}
        <mesh position={[0, 1.1, depth / 2 + 0.05]} castShadow>
          <boxGeometry args={[1.3, 2.2, 0.08]} />
          <meshStandardMaterial color="#451a03" roughness={0.5} />
        </mesh>

        {/* 1st Floor Cantilevered Balcony */}
        <mesh position={[-width / 4, 3.4, depth / 2 + 0.7]} castShadow>
          <boxGeometry args={[width / 2, 0.25, 1.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
        {/* Balcony Railing */}
        <mesh position={[-width / 4, 3.9, depth / 2 + 1.35]}>
          <boxGeometry args={[width / 2, 0.8, 0.05]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} transparent opacity={0.7} />
        </mesh>
        {/* Sliding Balcony Glass Doors */}
        <mesh position={[-width / 4, 4.4, depth / 2 + 0.05]}>
          <boxGeometry args={[2.0, 2.1, 0.05]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} transparent opacity={0.75} />
        </mesh>

        {/* Side & Front Windows */}
        <mesh position={[width / 4, 4.4, depth / 2 + 0.05]}>
          <boxGeometry args={[1.5, 1.4, 0.06]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[width / 4, 1.4, depth / 2 + 0.05]}>
          <boxGeometry args={[1.4, 1.3, 0.06]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Roof Concrete Slab & Parapet */}
        <mesh position={[0, mainBodyH + 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[width + 0.3, 0.25, depth + 0.3]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.8} />
        </mesh>
        <mesh position={[0, mainBodyH + 0.45, 0]}>
          <boxGeometry args={[width + 0.25, 0.45, depth + 0.25]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>

        {/* Overhead Sintex Style Black Water Tank & Staging */}
        <mesh position={[width / 3, mainBodyH + 0.7, -depth / 3]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 1.0, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>
    );
  }

  // --- 2. TRADITIONAL SLOPED ROOF (Heritage Mangalore Tile) ---
  if (style === 'traditional-sloped') {
    const wallH = height - 2.0;
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Main Walls (Earthen cream plaster) */}
        <mesh position={[0, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, wallH, depth]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.8} />
        </mesh>

        {/* Front Open Verandah (Thinnai) Plinth */}
        <mesh position={[0, 0.3, depth / 2 + 0.8]} castShadow>
          <boxGeometry args={[width, 0.6, 1.6]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Carved Wooden Pillars */}
        {[-width / 3, 0, width / 3].map((x, i) => (
          <mesh key={i} position={[x, 1.8, depth / 2 + 1.4]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 2.4, 12]} />
            <meshStandardMaterial color="#451a03" roughness={0.6} />
          </mesh>
        ))}

        {/* Front Door with Brass details */}
        <mesh position={[0, 1.4, depth / 2 + 0.05]} castShadow>
          <boxGeometry args={[1.3, 2.2, 0.08]} />
          <meshStandardMaterial color="#3b1d11" roughness={0.4} />
        </mesh>

        {/* Traditional Pitched Mangalore Tile Roof */}
        <mesh position={[0, wallH + 1.0, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[Math.max(width, depth) * 0.72, 2.2, 4]} />
          <meshStandardMaterial
            color="#b94a2b"
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>

        {/* Roof Overhang Eaves Fascia */}
        <mesh position={[0, wallH + 0.1, 0]}>
          <boxGeometry args={[width + 0.8, 0.2, depth + 0.8]} />
          <meshStandardMaterial color="#451a03" roughness={0.6} />
        </mesh>

        {/* Wooden Windows */}
        {[-width / 4, width / 4].map((x, i) => (
          <mesh key={i} position={[x, wallH / 2 + 0.5, depth / 2 + 0.05]}>
            <boxGeometry args={[1.2, 1.3, 0.08]} />
            <meshStandardMaterial color="#1c1917" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>
    );
  }

  // --- 3. STILT PARKING VILLA ---
  if (style === 'stilt-parking') {
    const stiltH = 2.8;
    const upperH = height - stiltH;
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Ground Stilt Concrete Columns */}
        {[
          [-width / 2 + 0.5, -depth / 2 + 0.5],
          [width / 2 - 0.5, -depth / 2 + 0.5],
          [-width / 2 + 0.5, depth / 2 - 0.5],
          [width / 2 - 0.5, depth / 2 - 0.5],
        ].map(([cx, cz], i) => (
          <mesh key={i} position={[cx, stiltH / 2, cz]} castShadow receiveShadow>
            <boxGeometry args={[0.45, stiltH, 0.45]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
        ))}

        {/* Enclosed Ground Staircase & Utility core at rear */}
        <mesh position={[width / 4, stiltH / 2, -depth / 4]} castShadow>
          <boxGeometry args={[width / 2, stiltH, depth / 2]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>

        {/* Ground Floor Parking Bay Floor */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>

        {/* Upper Residential Cantilevered Volume */}
        <mesh position={[0, stiltH + upperH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, upperH, depth]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
        </mesh>

        {/* Upper Front Glass Balcony */}
        <mesh position={[0, stiltH + 0.15, depth / 2 + 0.7]} castShadow>
          <boxGeometry args={[width * 0.8, 0.25, 1.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[0, stiltH + 0.65, depth / 2 + 1.35]}>
          <boxGeometry args={[width * 0.8, 0.85, 0.05]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} transparent opacity={0.65} />
        </mesh>

        {/* Upper Windows */}
        <mesh position={[0, stiltH + upperH / 2, depth / 2 + 0.05]}>
          <boxGeometry args={[width * 0.7, upperH * 0.6, 0.05]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} transparent opacity={0.75} />
        </mesh>

        {/* Roof Solar Water Heater Tank */}
        <mesh position={[-width / 4, height + 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1.8, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // --- 4. CONTEMPORARY BOX / MINIMALIST CUBE ---
  if (style === 'contemporary-box') {
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Primary Dark Graphite Volume */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} />
        </mesh>

        {/* Cantilevered White Architectural Frame Box */}
        <mesh position={[-width / 6, height * 0.6, depth / 2 + 0.3]} castShadow>
          <boxGeometry args={[width * 0.65, height * 0.45, 0.7]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>

        {/* Vertical Teak Wood Louvers */}
        {[-1.2, -0.8, -0.4, 0, 0.4].map((lx, i) => (
          <mesh key={i} position={[width / 3 + lx, height * 0.6, depth / 2 + 0.15]} castShadow>
            <boxGeometry args={[0.08, height * 0.5, 0.12]} />
            <meshStandardMaterial color="#92400e" roughness={0.6} />
          </mesh>
        ))}

        {/* Corner Wrap-Around Window */}
        <mesh position={[-width / 2 + 0.05, height * 0.6, depth / 2 + 0.05]}>
          <boxGeometry args={[0.05, height * 0.35, 1.8]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
        </mesh>
      </group>
    );
  }

  // --- 5. COURTYARD / THOTTI MANE (30x40) ---
  if (style === 'courtyard') {
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Warm Terracotta Brick Walls */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#9a3412" roughness={0.8} />
        </mesh>

        {/* Central Courtyard Skylight Opening */}
        <mesh position={[0, height + 0.3, 0]}>
          <boxGeometry args={[width * 0.35, 0.4, depth * 0.35]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} transparent opacity={0.65} />
        </mesh>

        {/* Decorative Jali Brick Screen Panel on Facade */}
        <mesh position={[0, height * 0.5, depth / 2 + 0.1]} castShadow>
          <boxGeometry args={[width * 0.4, height * 0.5, 0.12]} />
          <meshStandardMaterial color="#ea580c" roughness={0.8} wireframe />
        </mesh>

        {/* Front Balconies */}
        {[-width / 3, width / 3].map((bx, i) => (
          <mesh key={i} position={[bx, height * 0.55, depth / 2 + 0.6]} castShadow>
            <boxGeometry args={[1.8, 0.2, 1.2]} />
            <meshStandardMaterial color="#451a03" roughness={0.7} />
          </mesh>
        ))}
      </group>
    );
  }

  // --- 6. APARTMENTS / MULTI-FAMILY FLATS ---
  if (style === 'apartments') {
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Residential Body */}
        <mesh position={[-0.6, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width - 1.2, height, depth]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
        </mesh>

        {/* External Staircase Tower on Right Side */}
        <mesh position={[width / 2 - 0.6, (height + 1.2) / 2, 0]} castShadow>
          <boxGeometry args={[1.2, height + 1.2, depth * 0.5]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>

        {/* Dual Balconies per Floor */}
        {[3.2, 6.2].map((by, fi) => (
          <group key={fi}>
            <mesh position={[-width / 4, by, depth / 2 + 0.6]} castShadow>
              <boxGeometry args={[2.4, 0.2, 1.2]} />
              <meshStandardMaterial color="#334155" roughness={0.7} />
            </mesh>
            <mesh position={[-width / 4, by + 0.45, depth / 2 + 1.15]}>
              <boxGeometry args={[2.4, 0.7, 0.05]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  // --- 7. LUXURY EXECUTIVE VILLA / ESTATE (40x60) ---
  if (style === 'villa') {
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Main Grand Residence Body */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>

        {/* Ground Floor Double Garage */}
        <mesh position={[-width / 4, 1.6, depth / 2 + 0.05]} castShadow>
          <boxGeometry args={[4.8, 2.8, 0.15]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Double-Height Glass Curtain Atrium */}
        <mesh position={[width / 4, height * 0.5, depth / 2 + 0.1]}>
          <boxGeometry args={[4.5, height * 0.65, 0.1]} />
          <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.1} transparent opacity={0.7} />
        </mesh>

        {/* Floating Cantilever Balcony Deck */}
        <mesh position={[0, height * 0.65, depth / 2 + 1.2]} castShadow>
          <boxGeometry args={[width * 0.7, 0.35, 2.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      </group>
    );
  }

  // --- 8. COMMERCIAL COMPLEX ---
  if (style === 'commercial') {
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Commercial Building Structure */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Ground Floor Retail Glazed Storefront */}
        <mesh position={[0, 1.8, depth / 2 + 0.1]}>
          <boxGeometry args={[width * 0.9, 3.2, 0.1]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
        </mesh>

        {/* Upper Curtain Wall Glazing Ribbon Bands */}
        {[5.5, 9.0].map((wy, idx) => (
          <mesh key={idx} position={[0, wy, depth / 2 + 0.05]}>
            <boxGeometry args={[width * 0.88, 2.2, 0.08]} />
            <meshStandardMaterial color="#0369a1" metalness={0.9} roughness={0.1} transparent opacity={0.75} />
          </mesh>
        ))}

        {/* Top Architectural Crown */}
        <mesh position={[0, height + 0.5, 0]}>
          <boxGeometry args={[width + 0.2, 0.8, depth + 0.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // --- 9. FUSION GABLE COTTAGE (Matches User's Fusion 360 Image 1) ---
  if (style === 'fusion-gable-cottage') {
    const mainBodyH = 4.2;
    const roofRidgeH = 2.4;
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Foundation Plinth Slab */}
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <boxGeometry args={[width + 0.6, 0.3, depth + 0.6]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>

        {/* Left Ground Floor Stepped Extension Wing */}
        <mesh position={[-width / 3.2, 1.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.42, 2.3, depth * 0.85]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
        </mesh>
        {/* Flat Parapet Trim on Left Wing */}
        <mesh position={[-width / 3.2, 2.5, 0]} castShadow>
          <boxGeometry args={[width * 0.44, 0.15, depth * 0.88]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>

        {/* Main 2-Story Building Body (Right & Center) */}
        <mesh position={[width * 0.14, 0.3 + mainBodyH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.68, mainBodyH, depth * 0.82]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>

        {/* Ground Floor Main Entry Recess */}
        <mesh position={[0.2, 1.2, depth * 0.41 + 0.02]} castShadow>
          <boxGeometry args={[2.2, 2.1, 0.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>

        {/* Second Floor Recessed Windows (Black rectangular apertures) */}
        <mesh position={[-0.4, 3.4, depth * 0.41 + 0.02]} castShadow>
          <boxGeometry args={[1.3, 1.1, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[1.6, 3.4, depth * 0.41 + 0.02]} castShadow>
          <boxGeometry args={[1.3, 1.1, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Asymmetrical Pitched Gable Roof - Left Pitch */}
        <group position={[width * 0.12, 0.3 + mainBodyH, 0]}>
          {/* Main Ridge Beam */}
          <mesh position={[-0.2, roofRidgeH * 0.6, 0]}>
            <boxGeometry args={[0.15, 0.25, depth * 0.95]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>

          {/* Left Roof Slope Plane */}
          <mesh
            position={[-width * 0.2, roofRidgeH * 0.35, 0]}
            rotation={[0, 0, 0.38]}
            castShadow
          >
            <boxGeometry args={[width * 0.48, 0.14, depth * 0.94]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>

          {/* Right Roof Slope Plane (Steeper/Longer Asymmetrical) */}
          <mesh
            position={[width * 0.22, roofRidgeH * 0.32, 0]}
            rotation={[0, 0, -0.42]}
            castShadow
          >
            <boxGeometry args={[width * 0.52, 0.14, depth * 0.94]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>

          {/* Chimney on the Roof Ridge with Twin Flue Vent Caps */}
          <group position={[0.2, roofRidgeH * 0.5 + 0.6, -depth * 0.15]}>
            {/* Chimney Body */}
            <mesh castShadow>
              <boxGeometry args={[0.55, 1.3, 0.65]} />
              <meshStandardMaterial color="#334155" roughness={0.7} />
            </mesh>
            {/* Chimney Cap */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <boxGeometry args={[0.68, 0.12, 0.78]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
            {/* Twin Flue Pipes */}
            {[-0.15, 0.15].map((fx, fi) => (
              <mesh key={fi} position={[fx, 0.85, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.25, 12]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
          </group>
        </group>

        {/* Front Timber Pergola Porch Structure */}
        <group position={[0.3, 0, depth * 0.42]}>
          {/* Raised Wooden Teak Deck Platform */}
          <mesh position={[0, 0.2, 0.8]} receiveShadow>
            <boxGeometry args={[3.4, 0.25, 1.8]} />
            <meshStandardMaterial color="#92400e" roughness={0.7} />
          </mesh>

          {/* Front Structural Steel Posts */}
          {[-1.5, 1.5].map((px, pi) => (
            <mesh key={pi} position={[px, 1.25, 1.6]} castShadow>
              <boxGeometry args={[0.12, 2.2, 0.12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}

          {/* Pergola Main Header Beam */}
          <mesh position={[0, 2.35, 1.6]} castShadow>
            <boxGeometry args={[3.6, 0.14, 0.14]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Exposed Wooden Crossbeams (Rafters) */}
          {[-1.4, -0.9, -0.4, 0.1, 0.6, 1.1, 1.4].map((rx, ri) => (
            <mesh key={ri} position={[rx, 2.45, 0.8]} castShadow>
              <boxGeometry args={[0.08, 0.12, 1.9]} />
              <meshStandardMaterial color="#b45309" roughness={0.6} />
            </mesh>
          ))}
        </group>

        {/* Tall Corner Structural Post on Far Right */}
        <mesh position={[width * 0.47, 2.6, depth * 0.41]} castShadow>
          <boxGeometry args={[0.08, 4.8, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // --- 10. FUSION MODERN VILLA & POOL PAVILION (Matches User's Fusion 360 Image 2) ---
  if (style === 'fusion-modern-villa') {
    const groundH = 3.2;
    const upperH = 3.0;
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Surrounding Green Lawn Perimeter Plot */}
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[width + 1.8, 0.08, depth + 1.8]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>

        {/* Concrete Foundation Plinth Platform */}
        <mesh position={[0, 0.18, 0]} receiveShadow>
          <boxGeometry args={[width + 0.8, 0.2, depth + 0.8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
        </mesh>

        {/* --- GROUND FLOOR OUTDOOR AMENITIES --- */}
        {/* Sunken Fire-Pit Conversation Lounge (Front Left) */}
        <group position={[-width * 0.28, 0.25, depth * 0.28]}>
          {/* Sunken Basin Floor */}
          <mesh receiveShadow>
            <boxGeometry args={[2.8, 0.1, 2.4]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          {/* Perimeter Wooden Bench Seating */}
          {/* Back Bench */}
          <mesh position={[0, 0.22, -0.9]} castShadow>
            <boxGeometry args={[2.4, 0.35, 0.4]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          {/* Left Bench */}
          <mesh position={[-1.0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.4, 0.35, 1.8]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          {/* Right Bench */}
          <mesh position={[1.0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.4, 0.35, 1.8]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          {/* Central Fire Hearth */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.6, 0.2, 0.6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <boxGeometry args={[0.3, 0.08, 0.3]} />
            <meshStandardMaterial color="#ea580c" roughness={0.2} emissive="#ea580c" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* Adjacent Warm Teak Sun Deck Patio */}
        <mesh position={[0, 0.26, depth * 0.28]} receiveShadow>
          <boxGeometry args={[2.4, 0.12, 2.4]} />
          <meshStandardMaterial color="#a16207" roughness={0.6} />
        </mesh>

        {/* Inground Turquoise Reflection Lap Pool (Front Right) */}
        <group position={[width * 0.28, 0.24, depth * 0.28]}>
          {/* Pool Coping Border */}
          <mesh receiveShadow>
            <boxGeometry args={[3.0, 0.12, 2.2]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Pool Turquoise Water */}
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[2.6, 0.1, 1.8]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.2} transparent opacity={0.8} />
          </mesh>
        </group>

        {/* --- GROUND FLOOR MAIN RESIDENCE --- */}
        {/* Rear Concrete Structural Core */}
        <mesh position={[0, 0.28 + groundH / 2, -depth * 0.18]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.88, groundH, depth * 0.5]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>

        {/* Floor-to-Ceiling Cyan Architectural Glass Curtain Wall */}
        <mesh position={[-width * 0.12, 0.28 + groundH / 2, depth * 0.08]}>
          <boxGeometry args={[width * 0.62, groundH * 0.92, 0.08]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
        </mesh>
        {/* Glass Wall Dark Mullions */}
        {[-width * 0.38, -width * 0.22, -width * 0.06, width * 0.1].map((mx, mi) => (
          <mesh key={mi} position={[mx, 0.28 + groundH / 2, depth * 0.09]}>
            <boxGeometry args={[0.06, groundH, 0.08]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        {/* --- CANTILEVERED INTERMEDIATE FLOOR SLAB --- */}
        <mesh position={[0, 0.28 + groundH, 0]} castShadow receiveShadow>
          <boxGeometry args={[width + 0.4, 0.32, depth + 0.4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Dark Fascia Edge on Floor Slab */}
        <mesh position={[0, 0.28 + groundH, depth / 2 + 0.2]}>
          <boxGeometry args={[width + 0.42, 0.34, 0.04]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>

        {/* --- FLOATING EXTERIOR CANTILEVER STAIRCASE --- */}
        <group position={[width * 0.35, 0.35, depth * 0.06]}>
          {/* Slanted Stringer Beam */}
          <mesh position={[0, groundH * 0.45, 0]} rotation={[0.55, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.18, groundH * 1.3]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Individual Floating Wooden Stair Treads */}
          {[0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3.0].map((sy, si) => (
            <mesh key={si} position={[0, sy, (si - 4.5) * 0.28]} castShadow>
              <boxGeometry args={[0.9, 0.08, 0.25]} />
              <meshStandardMaterial color="#a16207" roughness={0.6} />
            </mesh>
          ))}
        </group>

        {/* --- UPPER LEVEL ARCHITECTURE --- */}
        {/* Left Side: Minimalist Master Suite with Vertical Louvers */}
        <group position={[-width * 0.18, 0.6 + groundH + upperH / 2, -depth * 0.05]}>
          {/* Suite White Facade Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width * 0.54, upperH, depth * 0.65]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          {/* Vertical Black Sunshade Louvers Band */}
          {[-1.8, -1.5, -1.2, -0.9, -0.6, -0.3, 0, 0.3, 0.6].map((lx, li) => (
            <mesh key={li} position={[lx, 0.1, depth * 0.33 + 0.04]} castShadow>
              <boxGeometry args={[0.06, upperH * 0.75, 0.1]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          {/* Cyan Ribbon Window Behind Louvers */}
          <mesh position={[-0.6, 0.1, depth * 0.33]}>
            <boxGeometry args={[2.8, upperH * 0.72, 0.04]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
          </mesh>
        </group>

        {/* Right Side: Open-Air Rooftop Pergola Terrace */}
        <group position={[width * 0.22, 0.6 + groundH, depth * 0.08]}>
          {/* Teak Deck Floor */}
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[width * 0.42, 0.06, depth * 0.45]} />
            <meshStandardMaterial color="#a16207" roughness={0.7} />
          </mesh>

          {/* Cyan Glass Balustrade Railing */}
          <mesh position={[0, 0.5, depth * 0.23]}>
            <boxGeometry args={[width * 0.42, 0.9, 0.04]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} transparent opacity={0.65} />
          </mesh>
          {/* Balustrade Black Top Rail */}
          <mesh position={[0, 0.95, depth * 0.23]}>
            <boxGeometry args={[width * 0.43, 0.05, 0.06]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Steel Pergola Frame */}
          {[-width * 0.19, width * 0.19].map((cx, ci) => (
            <mesh key={ci} position={[cx, 1.25, 0]} castShadow>
              <boxGeometry args={[0.08, 2.5, 0.08]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          <mesh position={[0, 2.5, 0]} castShadow>
            <boxGeometry args={[width * 0.42, 0.1, depth * 0.46]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} wireframe />
          </mesh>
          {/* Pergola Cedar Louvers */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((px, pi) => (
            <mesh key={pi} position={[px, 2.56, 0]} castShadow>
              <boxGeometry args={[0.08, 0.08, depth * 0.44]} />
              <meshStandardMaterial color="#b45309" roughness={0.6} />
            </mesh>
          ))}
        </group>

        {/* Cantilevered Flat Roof Slab with Dark Fascia */}
        <mesh position={[0, 0.6 + groundH + upperH + 0.15, -depth * 0.02]} castShadow>
          <boxGeometry args={[width * 0.92, 0.28, depth * 0.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  // --- 11. SKYLINE LUXURY MULTI-STORY APARTMENTS (High-Grade Bengaluru Tower) ---
  if (style === 'skyline-luxury-apartments') {
    const stiltH = 3.4;
    const floorH = 2.8;
    const numFloors = 4;
    return (
      <group>
        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
            <meshBasicMaterial color="#dc0000" wireframe />
          </mesh>
        )}

        {/* Foundation Base Plinth */}
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <boxGeometry args={[width + 0.8, 0.3, depth + 0.8]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>

        {/* GROUND FLOOR STILT PARKING & RECEPTION LOBBY */}
        <group position={[0, 0.3, 0]}>
          {/* Heavy Structural Concrete Columns (Pilotis) */}
          {[
            [-width / 2 + 1, -depth / 2 + 1.2],
            [-width / 2 + 1, depth / 2 - 1.2],
            [width / 2 - 1, -depth / 2 + 1.2],
            [width / 2 - 1, depth / 2 - 1.2],
            [0, -depth / 2 + 1.2],
            [0, depth / 2 - 1.2],
          ].map(([cx, cz], ci) => (
            <mesh key={ci} position={[cx, stiltH / 2, cz]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.3, stiltH, 16]} />
              <meshStandardMaterial color="#64748b" roughness={0.6} />
            </mesh>
          ))}

          {/* Glazed Resident Reception Lobby (Center Front) */}
          <mesh position={[0, stiltH / 2, 0]}>
            <boxGeometry args={[4.2, stiltH, depth * 0.45]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
          </mesh>
          {/* Lobby Door Frame */}
          <mesh position={[0, 1.2, depth * 0.23]}>
            <boxGeometry args={[1.8, 2.4, 0.08]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* RESIDENTIAL FLOORS (4 Floors of High-Grade Flats) */}
        {Array.from({ length: numFloors }).map((_, fi) => {
          const floorY = 0.3 + stiltH + fi * floorH;
          return (
            <group key={fi} position={[0, floorY, 0]}>
              {/* Floor Slab */}
              <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
                <boxGeometry args={[width + 0.2, 0.24, depth + 0.2]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
              </mesh>

              {/* Terracotta Wirecut Brick Facade Blocks */}
              <mesh position={[-width * 0.25, floorH / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width * 0.42, floorH - 0.24, depth * 0.88]} />
                <meshStandardMaterial color="#b94a2b" roughness={0.8} />
              </mesh>
              <mesh position={[width * 0.25, floorH / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width * 0.42, floorH - 0.24, depth * 0.88]} />
                <meshStandardMaterial color="#b94a2b" roughness={0.8} />
              </mesh>

              {/* Vertical Architectural White Sun-Breaker Fins (Brise-Soleil) */}
              {[-width * 0.42, -width * 0.28, width * 0.28, width * 0.42].map((bx, bi) => (
                <mesh key={bi} position={[bx, floorH / 2, depth * 0.45]} castShadow>
                  <boxGeometry args={[0.08, floorH, 0.35]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.4} />
                </mesh>
              ))}

              {/* Cantilevered Individual Balconies on Front */}
              {[-width * 0.24, width * 0.24].map((bx, bi) => (
                <group key={bi} position={[bx, 0.15, depth / 2 + 0.7]}>
                  {/* Balcony Concrete Base with Teak Soffit */}
                  <mesh position={[0, 0.1, 0]} castShadow>
                    <boxGeometry args={[2.8, 0.2, 1.4]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.5} />
                  </mesh>
                  {/* Tinted Architectural Glass Balustrade */}
                  <mesh position={[0, 0.6, 0.65]}>
                    <boxGeometry args={[2.7, 0.85, 0.04]} />
                    <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
                  </mesh>
                  {/* Stainless Steel Handrail */}
                  <mesh position={[0, 1.05, 0.65]}>
                    <boxGeometry args={[2.8, 0.06, 0.06]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
                  </mesh>
                </group>
              ))}
            </group>
          );
        })}

        {/* CENTRAL VERTICAL GLASS ELEVATOR & STAIRWELL CORE */}
        <mesh position={[0, (height + 1.2) / 2, depth * 0.46]} castShadow>
          <boxGeometry args={[2.8, height + 1.2, 0.3]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.95} roughness={0.1} transparent opacity={0.75} />
        </mesh>

        {/* PENTHOUSE ROOFTOP TERRACE & AMENITIES */}
        <group position={[0, 0.3 + stiltH + numFloors * floorH, 0]}>
          {/* Rooftop Parapet Wall */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[width + 0.3, 1.0, depth + 0.3]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} wireframe />
          </mesh>

          {/* Lift Machine Room (LMR) Penthouse Tower */}
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[3.8, 2.6, 4.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>

          {/* Rooftop Infinity Deck & Water Basin */}
          <mesh position={[-width * 0.25, 0.2, 0]}>
            <boxGeometry args={[3.6, 0.25, 3.6]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.1} transparent opacity={0.8} />
          </mesh>

          {/* Rooftop Pergola Canopy with Teak Beams */}
          <group position={[width * 0.25, 0, 0]}>
            {[-1.4, 1.4].map((px, pi) => (
              <mesh key={pi} position={[px, 1.3, 0]} castShadow>
                <boxGeometry args={[0.08, 2.4, 0.08]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} />
              </mesh>
            ))}
            {[-1.2, -0.6, 0, 0.6, 1.2].map((rx, ri) => (
              <mesh key={ri} position={[rx, 2.45, 0]} castShadow>
                <boxGeometry args={[0.06, 0.08, 3.2]} />
                <meshStandardMaterial color="#b45309" roughness={0.6} />
              </mesh>
            ))}
          </group>

          {/* Commercial Rooftop Twin Water Tanks on Steel Staging */}
          {[-0.8, 0.8].map((tx, ti) => (
            <mesh key={ti} position={[tx, 3.0, -1.2]} castShadow>
              <cylinderGeometry args={[0.65, 0.65, 1.4, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.4} />
            </mesh>
          ))}
        </group>
      </group>
    );
  }

  // Default fallback
  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>
    </group>
  );
};
