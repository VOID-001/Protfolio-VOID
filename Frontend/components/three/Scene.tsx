'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import OrbitalPath from './OrbitalPath';
import ProjectOrb from './ProjectOrb';
import SkillRing from './SkillRing';
import CameraController from './CameraController';
import type { Project, OrbitConfig, OrbitTier } from '@/lib/types';
import { useOrbInteraction } from '@/hooks/useOrbInteraction';

// Orbital physics config — layout decisions, not CMS content
const ORB_CONFIGS: Record<OrbitTier, OrbitConfig> = {
  A: { xRadius: 7, yRadius: 4.5, rotX: 0.17, speed: 0.12 },
  B: { xRadius: 11, yRadius: 7, rotX: 0.61, speed: 0.075 },
  C: { xRadius: 16, yRadius: 10, rotX: 0.96, speed: 0.045 },
};

function getPhaseOffset(tier: OrbitTier, indexInTier: number): number {
  const counts: Record<OrbitTier, number> = { A: 2, B: 2, C: 2 };
  return indexInTier / counts[tier];
}

interface SceneProps {
  projects: Project[];
}

function SceneContent({ projects }: SceneProps) {
  const hoveredId = useOrbInteraction((s) => s.hoveredId);
  const selectedProject = useOrbInteraction((s) => s.selectedProject);

  // Determine which tier to highlight based on hover or selection
  const highlightedTier = useMemo(() => {
    if (selectedProject) return selectedProject.orbitTier;
    const hoveredProject = projects.find((p) => p.id === hoveredId);
    return hoveredProject?.orbitTier ?? null;
  }, [hoveredId, selectedProject, projects]);

  // Track index within each tier for phase offset
  const tierCounters = useMemo(() => {
    const counters: Record<string, number> = {};
    return projects.map((p) => {
      const key = p.orbitTier;
      counters[key] = (counters[key] ?? 0);
      const idx = counters[key];
      counters[key]++;
      return idx;
    });
  }, [projects]);

  return (
    <>
      {/* No background color — scene is transparent, Canvas 2D layer shows through */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={0.3} />

      <Suspense fallback={null}>
        {projects.map((project, i) => (
          <ProjectOrb
            key={project.id}
            project={project}
            orbitConfig={ORB_CONFIGS[project.orbitTier]}
            speed={ORB_CONFIGS[project.orbitTier].speed}
            phaseOffset={getPhaseOffset(project.orbitTier, tierCounters[i])}
          />
        ))}
        <OrbitalPath highlightedTier={highlightedTier} />
        <SkillRing activeDomain={null} />
        <CameraController />
      </Suspense>

      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.4}
          radius={0.6}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function Scene({ projects }: SceneProps) {
  return (
    <Canvas
      dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2]}
      camera={{ fov: 60, position: [0, 6, 20], near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'auto',
      }}
    >
      <SceneContent projects={projects} />
    </Canvas>
  );
}

