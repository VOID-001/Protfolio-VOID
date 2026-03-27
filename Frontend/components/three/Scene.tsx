'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { StarField, Comets } from './StarField';
import { BlackHole } from './BlackHole';
import { ProjectOrb } from './ProjectOrb';
import { OrbitalPaths } from './OrbitalPaths';
import { CameraController } from './CameraController';
import { useSceneStore } from '@/hooks/useSceneStore';
import type { Project } from '@/lib/types';

interface SceneProps {
  projects: Project[];
}

function OrbitalSystem({ projects, isMobile }: { projects: Project[], isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const selectedProject = useSceneStore.getState().selectedProject;
      if (!selectedProject) {
        const vel = useSceneStore.getState().scrollVelocity;
        groupRef.current.rotation.y += vel;
        useSceneStore.setState({ scrollVelocity: vel * 0.88 });
      }
    }
  });

  return (
    <group ref={groupRef}>
      {projects.map((p, i) => (
        <ProjectOrb key={p.id} project={p} index={i} isMobile={isMobile} />
      ))}
      <OrbitalPaths />
    </group>
  );
}

function EnvironmentGroup({ children }: { children: React.ReactNode }) {
  const envRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (envRef.current) {
      const state = useSceneStore.getState();
      envRef.current.rotation.y = state.sceneAzimuth;
      envRef.current.rotation.x = state.sceneElevation; 
    }
  });

  return <group ref={envRef}>{children}</group>;
}

export function Scene({ projects }: SceneProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Canvas
      dpr={isMobile ? [1, 1] : [1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      camera={{ fov: 45, position: [0, 2, 14], near: 0.1, far: 500 }}
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ position: 'absolute', inset: 0, zIndex: 1 }}
    >
      <color attach="background" args={['#03010e']} />
      <fog attach="fog" args={['#03010e', 40, 120]} />

      <ambientLight intensity={0.04} color="#0a0520" />
      <directionalLight position={[8, 5, 6]} intensity={1.6} color="#fff4dc" castShadow={false} />

      <Suspense fallback={null}>
        <EnvironmentGroup>
          <StarField isMobile={isMobile} />
          <Comets />
          <OrbitalSystem projects={projects} isMobile={isMobile} />
        </EnvironmentGroup>
        <BlackHole />
        <CameraController />
      </Suspense>

      {!isMobile && (
        <EffectComposer>
          <Bloom
            intensity={1.1}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.9}
            mipmapBlur={true}
            radius={0.9}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
