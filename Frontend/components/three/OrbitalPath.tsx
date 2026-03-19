'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitTier } from '@/lib/types';
import { useOrbInteraction } from '@/hooks/useOrbInteraction';

interface OrbitDef {
  tier: OrbitTier;
  xRadius: number;
  yRadius: number;
  rotX: number;
}

const ORBIT_CONFIGS: OrbitDef[] = [
  { tier: 'A', xRadius: 7, yRadius: 4.5, rotX: 0.17 },
  { tier: 'B', xRadius: 11, yRadius: 7, rotX: 0.61 },
  { tier: 'C', xRadius: 16, yRadius: 10, rotX: 0.96 },
];

interface OrbitalPathProps {
  highlightedTier: OrbitTier | null;
}

const Line = 'line' as any;

function SingleOrbitPath({
  config,
  isHighlighted,
}: {
  config: OrbitDef;
  isHighlighted: boolean;
}) {
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const targetOpacity = useRef(isHighlighted ? 0.4 : 0.1);

  const { geometry, tubeGeometry } = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0,
      config.xRadius, config.yRadius,
      0, 2 * Math.PI,
      false, 0
    );
    const points = curve.getPoints(200);
    // Convert 2D points to 3D (XZ plane)
    const points3D = points.map(
      (p) => new THREE.Vector3(p.x, 0, p.y)
    );
    const geo = new THREE.BufferGeometry().setFromPoints(points3D);

    // Create a 3D curve for the interactive tube
    class EllipseCurve3D extends THREE.Curve<THREE.Vector3> {
      constructor() {
        super();
      }
      getPoint(t: number, optionalTarget = new THREE.Vector3()) {
        const p = curve.getPoint(t);
        return optionalTarget.set(p.x, 0, p.y);
      }
    }
    const tubeGeo = new THREE.TubeGeometry(new EllipseCurve3D(), 100, 0.8, 8, true);

    return { geometry: geo, tubeGeometry: tubeGeo };
  }, [config.xRadius, config.yRadius]);

  const { slowedOrbit, toggleSlowOrbit } = useOrbInteraction();
  const isSlowed = slowedOrbit === config.tier;

  // Update target when highlight or slowed state changes
  targetOpacity.current = isSlowed ? 0.5 : (isHighlighted ? 0.4 : 0.12);

  useFrame(() => {
    if (materialRef.current) {
      // Smooth lerp to target opacity
      materialRef.current.opacity +=
        (targetOpacity.current - materialRef.current.opacity) * 0.05;
    }
  });

  return (
    <group rotation-x={config.rotX}>
      {/* Invisible thick tube for easy clicking */}
      <mesh 
        geometry={tubeGeometry} 
        visible={false} 
        onClick={(e) => {
          e.stopPropagation();
          toggleSlowOrbit(config.tier);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      />
      
      {/* Visual orbit line */}
      <Line geometry={geometry}>
        <lineBasicMaterial
          ref={materialRef}
          color="#c084fc"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </Line>
    </group>
  );
}

function OrbitalPath({ highlightedTier }: OrbitalPathProps) {
  return (
    <group>
      {ORBIT_CONFIGS.map((config) => (
        <SingleOrbitPath
          key={config.tier}
          config={config}
          isHighlighted={highlightedTier === config.tier}
        />
      ))}
    </group>
  );
}

export default OrbitalPath;
