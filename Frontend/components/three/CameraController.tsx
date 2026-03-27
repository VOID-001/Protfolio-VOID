'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useSceneStore } from '@/hooks/useSceneStore';

export function CameraController() {
  const { camera, gl, scene } = useThree();
  const selectedProject = useSceneStore((s) => s.selectedProject);
  const sceneBrightness = useSceneStore((s) => s.sceneBrightness);
  const introState = useSceneStore((s) => s.introState);

  const azimuth = useRef(0);
  const elevation = useRef(0.15); // Lowered to clearly see the bottom halo

  const targetRadius = useRef(14);
  const isDragging = useRef(false);
  const pointerPos = useRef({ x: 0, y: 0 });

  const defaultBgColor = new THREE.Color('#03010e');
  const tempVec = new THREE.Vector3();

  useEffect(() => {
    const handleMouseDown = () => (isDragging.current = true);
    const handleMouseUp = () => (isDragging.current = false);
    const handleMouseMove = (e: MouseEvent) => {
      pointerPos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerPos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isDragging.current) {
        azimuth.current -= e.movementX * 0.005;
        elevation.current -= e.movementY * 0.005;
        elevation.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, elevation.current));
        useSceneStore.getState().sceneAzimuth = azimuth.current;
        useSceneStore.getState().sceneElevation = elevation.current;
      }
    };
    const handleWheel = (e: WheelEvent) => {
      targetRadius.current += e.deltaY * 0.01;
      targetRadius.current = Math.max(8, Math.min(22, targetRadius.current));
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [gl]);

  // Handle selected project zoom
  useEffect(() => {
    if (introState !== 'ready') return;
    if (!selectedProject) {
      gsap.to(targetRadius, { current: 14, duration: 0.85, ease: 'power3.inOut' });
    }
  }, [selectedProject, introState]);

  // Handle Intro Sequence Hooks
  useEffect(() => {
    if (introState === 'pending') {
      camera.position.set(0, 40, 60);
      camera.lookAt(0, -0.8, 0);
    } else if (introState === 'warping') {
      gsap.fromTo(camera.position, 
        { x: 0, y: 40, z: 60 }, 
        { x: 0, y: 0, z: 14, duration: 2.5, ease: 'power3.inOut', onUpdate: () => camera.lookAt(0, 0, 0) }
      );
    }
  }, [introState, camera]);

  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const centerTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame((state, delta) => {
    if (introState !== 'ready') return;

    if (!selectedProject && !isDragging.current) {
      azimuth.current += 0.025 * delta;
      useSceneStore.getState().sceneAzimuth = azimuth.current;
    }

    if (scene.background instanceof THREE.Color) {
      scene.background.copy(defaultBgColor).multiplyScalar(sceneBrightness);
    }

    if (selectedProject) {
      const planetPos = useSceneStore.getState().selectedPlanetPosition;
      
      // Calculate a comfortable viewing offset from the planet
      // We want the camera to be slightly above and pulled back from the planet
      tempVec.copy(planetPos).add(new THREE.Vector3(0, 1.2, 5.5));
      
      // Include parallax if desired
      tempVec.x += pointerPos.current.x * 0.2;
      tempVec.y += pointerPos.current.y * 0.2;

      camera.position.lerp(tempVec, 0.04);
      lookAtTarget.current.lerp(planetPos, 0.06);
      camera.lookAt(lookAtTarget.current);

    } else {
      // Camera stays fixed on the Z-axis while the environment rotates around the origin
      const parallaxX = pointerPos.current.x * 0.4;
      const parallaxY = pointerPos.current.y * 0.4;

      tempVec.set(parallaxX, parallaxY, targetRadius.current);
      camera.position.lerp(tempVec, 0.08);
      
      lookAtTarget.current.lerp(centerTarget, 0.08);
      camera.lookAt(lookAtTarget.current);
    }
  });

  return null;
}
