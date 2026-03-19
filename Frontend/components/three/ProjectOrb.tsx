'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import type { Project, OrbitConfig } from '@/lib/types';
import { useOrbInteraction } from '@/hooks/useOrbInteraction';

interface ProjectOrbProps {
  project: Project;
  orbitConfig: OrbitConfig;
  speed: number;
  phaseOffset: number;
}

function ProjectOrb({ project, orbitConfig, speed, phaseOffset }: ProjectOrbProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(phaseOffset);
  const currentSpeedRef = useRef(speed);
  const worldPosRef = useRef(new THREE.Vector3());

  const { state, hoveredId, selectedId, setHovered, setSelected, slowedOrbit } =
    useOrbInteraction();

  // Compute orb properties from project data
  const radius = useMemo(
    () => 0.22 + (project.complexity / 10) * 0.22,
    [project.complexity]
  );
  const baseIntensity = useMemo(
    () => 0.3 + (project.recency / 10) * 0.6,
    [project.recency]
  );

  // Pre-compute the orbit curve once
  const curve = useMemo(
    () =>
      new THREE.EllipseCurve(
        0, 0,
        orbitConfig.xRadius, orbitConfig.yRadius,
        0, 2 * Math.PI,
        false, 0
      ),
    [orbitConfig.xRadius, orbitConfig.yRadius]
  );

  const isHovered = hoveredId === project.id;
  const isSelected = selectedId === project.id;
  const isDimmed = state === 'selected' && !isSelected;
  const isRingSlowed = slowedOrbit === project.orbitTier;

  // Use GSAP for selection scale exactly as requested (1.0 to 2.8, 600ms, power2.out)
  useEffect(() => {
    if (coreRef.current) {
      if (isSelected) {
        gsap.to(coreRef.current.scale, { x: 2.8, y: 2.8, z: 2.8, duration: 0.6, ease: 'power2.out' });
      } else if (isHovered && state !== 'selected') {
        gsap.to(coreRef.current.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.to(coreRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
      }
    }
  }, [isSelected, isHovered, state]);

  useFrame((_, delta) => {
    // Lerp speed to target
    const targetSpeed = isRingSlowed ? speed * 0.12 : speed;
    currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * Math.min(delta * 2, 0.1);
    
    // Advance orbital position
    progressRef.current += currentSpeedRef.current * delta;
    const t = progressRef.current % 1;
    const point = curve.getPoint(t);

    if (innerGroupRef.current) {
      innerGroupRef.current.position.set(point.x, 0, point.y);

      // Store world position for camera tween
      innerGroupRef.current.getWorldPosition(worldPosRef.current);
    }

    // Rotate core on Y axis
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.008 * delta * 60;

      // Animate emissive intensity
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      const targetIntensity = isDimmed ? 0.05 : baseIntensity;
      mat.emissiveIntensity +=
        (targetIntensity - mat.emissiveIntensity) * Math.min(delta * 5, 0.1);
    }

    // Pulse corona on hover
    if (coronaRef.current) {
      const coronaMat = coronaRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = isHovered ? 0.22 : isDimmed ? 0.03 : 0.1;
      coronaMat.opacity += (targetOpacity - coronaMat.opacity) * 0.05;
    }
  });

  const handleClick = () => {
    setSelected(project, worldPosRef.current.clone());
  };

  const handlePointerOver = (e: THREE.Event) => {
    (e as unknown as { stopPropagation: () => void }).stopPropagation();
    setHovered(project.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(null);
    document.body.style.cursor = 'default';
  };

  return (
    <group ref={groupRef} rotation-x={orbitConfig.rotX}>
      <group ref={innerGroupRef}>
        {/* Corona — soft halo */}
        <mesh ref={coronaRef} renderOrder={1}>
          <sphereGeometry args={[radius * 1.35, 32, 32]} />
          <meshBasicMaterial
            color="#c084fc"
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>

        {/* Core orb */}
        <mesh
          ref={coreRef}
          renderOrder={2}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color="#c084fc"
            emissive="#9b5cf6"
            emissiveIntensity={baseIntensity}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Point light */}
        <pointLight
          color="#c084fc"
          intensity={0.6}
          distance={3.5}
          decay={2}
        />

        {/* Floating label */}
        <Html
          position={[0, radius + 0.4, 0]}
          center
          style={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#ede9fe',
            whiteSpace: 'nowrap',
            letterSpacing: '0.08em',
            textShadow: '0 0 12px rgba(124, 58, 237, 0.6)',
            userSelect: 'none',
          }}
        >
          {project.title}
        </Html>
      </group>
    </group>
  );
}

export default ProjectOrb;
