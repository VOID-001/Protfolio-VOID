'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useOrbInteraction } from '@/hooks/useOrbInteraction';
import gsap from 'gsap';

function CameraController() {
  const { camera, gl } = useThree();
  const { state, selectedWorldPosition, clearSelection } = useOrbInteraction();

  const azimuthRef = useRef(0);
  const radiusRef = useRef(20);
  const elevationRef = useRef(0.32);
  const mouseRef = useRef({ x: 0, y: 0 });
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const isReducedMotion = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      isReducedMotion.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Mouse parallax listener
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll orbit handler
  useEffect(() => {
    const canvas = gl.domElement;

    const handleWheel = (e: WheelEvent) => {
      if (state === 'selected') return;
      e.preventDefault();
      azimuthRef.current += e.deltaY * 0.001;
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [gl, state]);

  // ESC key to clear selection
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state === 'selected') {
        clearSelection();
      }
    },
    [state, clearSelection]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Camera tween to selected orb
  useEffect(() => {
    if (state === 'selected' && selectedWorldPosition) {
      // Kill any existing tween
      if (tweenRef.current) tweenRef.current.kill();

      const targetPos = {
        x: selectedWorldPosition.x * 0.6,
        y: selectedWorldPosition.y + 2,
        z: selectedWorldPosition.z + 5,
      };

      tweenRef.current = gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 0.9,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });
    } else if (state === 'idle') {
      // Reverse: tween back to orbit position
      if (tweenRef.current) tweenRef.current.kill();

      const orbitX = Math.sin(azimuthRef.current) * radiusRef.current;
      const orbitZ = Math.cos(azimuthRef.current) * radiusRef.current;
      const orbitY = elevationRef.current * radiusRef.current;

      tweenRef.current = gsap.to(camera.position, {
        x: orbitX,
        y: orbitY,
        z: orbitZ,
        duration: 0.7,
        ease: 'power2.out',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });
    }
  }, [state, selectedWorldPosition, camera]);

  // Main animation loop
  useFrame((frameState, delta) => {
    if (state === 'selected') return;
    if (isReducedMotion.current) {
      // Static position, no animation
      frameState.camera.position.set(0, 6, 20);
      frameState.camera.lookAt(0, 0, 0);
      return;
    }

    // Auto-rotation
    azimuthRef.current += 0.04 * delta;

    const x = Math.sin(azimuthRef.current) * radiusRef.current;
    const z = Math.cos(azimuthRef.current) * radiusRef.current;
    const y = elevationRef.current * radiusRef.current;

    // Smooth lerp with mouse parallax
    frameState.camera.position.x +=
      (x + mouseRef.current.x * 0.8 - frameState.camera.position.x) * 0.02;
    frameState.camera.position.y +=
      (y + mouseRef.current.y * 0.5 - frameState.camera.position.y) * 0.02;
    frameState.camera.position.z +=
      (z - frameState.camera.position.z) * 0.02;

    frameState.camera.lookAt(0, 0, 0);
  });

  return null;
}

export default CameraController;
