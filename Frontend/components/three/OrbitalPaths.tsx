'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/hooks/useSceneStore';
import React from 'react';

const ORBIT_CONFIGS = [
  { rx: 4.0, ry: 2.8, inc: 0.55, py: 0.02, pz: 0.005 },
  { rx: 5.5, ry: 3.5, inc: 0.45, py: -0.015, pz: -0.008 },
  { rx: 7.0, ry: 4.5, inc: 0.35, py: 0.01, pz: 0.004 },
];

function OrbitLine({ config, tier }: { config: any; tier: number }) {
  const selectedOrbit = useSceneStore((s) => s.selectedOrbit);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, config.rx, config.ry, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(200);
    const vec3Points = points.map((p) => new THREE.Vector3(p.x, 0, p.y));
    return new THREE.BufferGeometry().setFromPoints(vec3Points);
  }, [config]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      const targetOpacity = selectedOrbit === tier ? 0.45 : 0.12;
      materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.1;
    }
  });

  return (
    <group ref={groupRef} rotation={[config.inc, 0, 0]}>
      {/* @ts-ignore */}
      <line geometry={geometry} renderOrder={3}>
        <lineBasicMaterial ref={materialRef} color="#7c3aed" transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </line>
    </group>
  );
}

export const OrbitalPaths = React.memo(function OrbitalPaths() {
  return (
    <group>
      {ORBIT_CONFIGS.map((conf, idx) => (
        <OrbitLine key={idx} config={conf} tier={idx} />
      ))}
    </group>
  );
});
