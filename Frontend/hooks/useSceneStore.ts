import { create } from 'zustand';
import * as THREE from 'three';
import type { Project } from '@/lib/types';

interface SceneStore {
  selectedProject: Project | null;
  hoveredProjectId: number | null;
  selectedOrbit: number;
  sceneBrightness: number;
  scrollSection: number;
  scrollVelocity: number;
  introState: 'pending' | 'warping' | 'ready';
  sceneAzimuth: number;
  sceneElevation: number;
  setSelectedProject: (p: Project | null) => void;
  setHoveredId: (id: number | null) => void;
  setSelectedOrbit: (i: number) => void;
  setSceneBrightness: (v: number) => void;
  setScrollSection: (i: number) => void;
  setScrollVelocity: (v: number) => void;
  setIntroState: (s: 'pending' | 'warping' | 'ready') => void;
  selectedPlanetPosition: THREE.Vector3;
}

export const useSceneStore = create<SceneStore>((set) => ({
  selectedProject: null,
  hoveredProjectId: null,
  selectedOrbit: -1,
  sceneBrightness: 1.0,
  scrollSection: 0,
  scrollVelocity: 0,
  introState: 'pending',
  sceneAzimuth: 0,
  sceneElevation: 0.15,
  setSelectedProject: (p) => set({ selectedProject: p }),
  setHoveredId: (id) => set({ hoveredProjectId: id }),
  setSelectedOrbit: (i) => set({ selectedOrbit: i }),
  setSceneBrightness: (v) => set({ sceneBrightness: v }),
  setScrollSection: (i) => set({ scrollSection: i }),
  setScrollVelocity: (v) => set({ scrollVelocity: v }),
  setIntroState: (s) => set({ introState: s }),
  selectedPlanetPosition: new THREE.Vector3(),
}));
