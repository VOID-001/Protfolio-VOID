import { create } from 'zustand';
import type { InteractionState, Project, OrbitTier } from '@/lib/types';
import * as THREE from 'three';

interface OrbInteractionStore {
  state: InteractionState;
  hoveredId: number | null;
  selectedId: number | null;
  selectedProject: Project | null;
  selectedWorldPosition: THREE.Vector3 | null;
  slowedOrbit: OrbitTier | null;
  setHovered: (id: number | null) => void;
  setSelected: (project: Project | null, worldPosition?: THREE.Vector3) => void;
  toggleSlowOrbit: (tier: OrbitTier) => void;
  clearSelection: () => void;
}

export const useOrbInteraction = create<OrbInteractionStore>((set, get) => ({
  state: 'idle',
  hoveredId: null,
  selectedId: null,
  selectedProject: null,
  selectedWorldPosition: null,
  slowedOrbit: null,

  setHovered: (id: number | null) => {
    const current = get();
    // Don't override selection with hover
    if (current.state === 'selected') return;
    set({
      state: id !== null ? 'hovering' : 'idle',
      hoveredId: id,
    });
  },

  setSelected: (project: Project | null, worldPosition?: THREE.Vector3) => {
    if (!project) {
      get().clearSelection();
      return;
    }
    set({
      state: 'selected',
      selectedId: project.id,
      selectedProject: project,
      selectedWorldPosition: worldPosition ?? null,
      hoveredId: null,
      // Optional: slowing the orbit when a project is clicked
      slowedOrbit: project.orbitTier,
    });
  },

  toggleSlowOrbit: (tier: OrbitTier) => {
    const current = get();
    set({
      slowedOrbit: current.slowedOrbit === tier ? null : tier
    });
  },

  clearSelection: () => {
    set({
      state: 'idle',
      hoveredId: null,
      selectedId: null,
      selectedProject: null,
      selectedWorldPosition: null,
      slowedOrbit: null,
    });
  },
}));
