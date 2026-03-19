'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { Domain } from '@/lib/types';

interface SkillRingProps {
  activeDomain: Domain | null;
}

const DOMAIN_ARCS: { domain: Domain; color: string; startAngle: number; endAngle: number }[] = [
  { domain: 'AI_ML', color: '#7c3aed', startAngle: 0, endAngle: Math.PI / 2 },
  { domain: 'LLM_INFRA', color: '#6d28d9', startAngle: Math.PI / 2, endAngle: Math.PI },
  { domain: 'BACKEND', color: '#4338ca', startAngle: Math.PI, endAngle: (3 * Math.PI) / 2 },
  { domain: 'FRONTEND', color: '#5b21b6', startAngle: (3 * Math.PI) / 2, endAngle: 2 * Math.PI },
];

function SkillArc({
  arc,
  isActive,
}: {
  arc: (typeof DOMAIN_ARCS)[number];
  isActive: boolean;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const innerR = 5;
    const outerR = 5.4;
    const segments = 64;
    const angleStep = (arc.endAngle - arc.startAngle) / segments;

    // Outer arc
    for (let i = 0; i <= segments; i++) {
      const angle = arc.startAngle + i * angleStep;
      const x = Math.cos(angle) * outerR;
      const y = Math.sin(angle) * outerR;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }

    // Inner arc (reversed)
    for (let i = segments; i >= 0; i--) {
      const angle = arc.startAngle + i * angleStep;
      const x = Math.cos(angle) * innerR;
      const y = Math.sin(angle) * innerR;
      shape.lineTo(x, y);
    }

    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape, 1);
    return geo;
  }, [arc.startAngle, arc.endAngle]);

  return (
    <mesh
      geometry={geometry}
      rotation-x={-Math.PI / 2}
      position-y={-0.5}
    >
      <meshBasicMaterial
        color={arc.color}
        transparent
        opacity={isActive ? 0.5 : 0.08}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function SkillRing({ activeDomain }: SkillRingProps) {
  return (
    <group>
      {DOMAIN_ARCS.map((arc) => (
        <SkillArc
          key={arc.domain}
          arc={arc}
          isActive={activeDomain === arc.domain}
        />
      ))}
    </group>
  );
}

export default SkillRing;
