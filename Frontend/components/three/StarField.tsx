'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/hooks/useSceneStore';
import React from 'react';

const vertexShader = `
  uniform float uTime;
  attribute float aOpacity;
  attribute float aSize;

  varying float vOpacity;
  void main() {
    vOpacity = aOpacity;
    vec4 mvp = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (200.0 / -mvp.z);
    gl_PointSize = clamp(gl_PointSize, 0.3, 8.0);
    gl_Position = projectionMatrix * mvp;
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying float vOpacity;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float twinkle = sin(uTime * 1.5 + vOpacity * 47.3) * 0.2 + 0.8;
    gl_FragColor = vec4(0.88, 0.90, 1.0, vOpacity * twinkle);
  }
`;

export const StarField = React.memo(function StarField({ isMobile }: { isMobile?: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const coreCount = isMobile ? 800 : 4000;
  const brightCount = isMobile ? 10 : 40;
  const count = coreCount + brightCount;
  
  const [positions, opacities, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const op = new Float32Array(count);
    const sz = new Float32Array(count);
    
    let i = 0;
    // Core stars
    while(i < coreCount) {
      const x = (Math.random() - 0.5) * 160;
      const y = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 160;
      if (Math.sqrt(x*x + y*y + z*z) < 80) {
        pos[i*3] = x;
        pos[i*3 + 1] = y;
        pos[i*3 + 2] = z;
        op[i] = 0.25 + Math.random() * 0.75;
        sz[i] = 0.3 + Math.random() * 1.9;
        i++;
      }
    }
    
    // Bright stars
    while(i < count) {
      const x = (Math.random() - 0.5) * 160;
      const y = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 160;
      if (Math.sqrt(x*x + y*y + z*z) < 80) {
        pos[i*3] = x;
        pos[i*3 + 1] = y;
        pos[i*3 + 2] = z;
        op[i] = 0.9 + Math.random() * 0.1;
        sz[i] = 2.5 + Math.random() * 1.5;
        i++;
      }
    }
    return [pos, op, sz];
  }, [coreCount, count]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      const isWarping = useSceneStore.getState().introState === 'warping';
      materialRef.current.uniforms.uTime.value += delta * (isWarping ? 8 : 1);
    }
  });

  return (
    <points renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} args={[positions, 3]} />
        <bufferAttribute attach="attributes-aOpacity" count={count} args={[opacities, 1]} />
        <bufferAttribute attach="attributes-aSize" count={count} args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
      />
    </points>
  );
});

export function Comets() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 18;
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const cometsData = useMemo(() => {
    return Array.from({ length: count }, () => {
      // Spawn far out and high up
      const start = new THREE.Vector3((Math.random() - 0.5) * 300, 60 + Math.random() * 60, (Math.random() - 0.5) * 300);
      // Shoot diagonally downwards towards the opposite side
      const end = new THREE.Vector3(start.x - 150 - Math.random() * 150, -100, start.z - 150 - Math.random() * 150);
      // Speed multiplier (slower for larger/brighter comets makes them cinematic)
      const speed = 25 + Math.random() * 35;
      const velocity = new THREE.Vector3().subVectors(end, start).normalize().multiplyScalar(speed);
      
      return {
        pos: start.clone(),
        start,
        velocity,
        delay: Math.random() * 15,
        active: false,
        life: 0,
        // Scale handles thickness and length
        thickness: 0.02 + Math.random() * 0.05,
        length: 6.0 + Math.random() * 12.0,
      };
    });
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Smooth time delta to avoid huge jumps on tab switch
    const d = Math.min(delta, 0.1);

    cometsData.forEach((comet, i) => {
      if (!comet.active) {
        comet.delay -= d;
        if (comet.delay <= 0) {
          comet.active = true;
          // Vary the start position slightly each reset
          comet.start.set((Math.random() - 0.5) * 300, 60 + Math.random() * 60, (Math.random() - 0.5) * 300);
          comet.pos.copy(comet.start);
          comet.life = 1.0;
        }
      } else {
        comet.pos.addScaledVector(comet.velocity, d);
        comet.life -= d * (0.15 + Math.random() * 0.1); // fade factor
        
        if (comet.life <= 0 || comet.pos.y < -100) {
          comet.active = false;
          comet.delay = 1.0 + Math.random() * 12.0; // random delay before respawn
        }
      }
      
      if (comet.active) {
        dummy.position.copy(comet.pos);
        // Orient the stretched sphere along its velocity vector
        const target = dummy.position.clone().add(comet.velocity);
        dummy.lookAt(target);
        
        // Fade out scale at the very end to prevent popping
        const fade = Math.min(1.0, comet.life * 3.0);
        dummy.scale.set(comet.thickness * fade, comet.thickness * fade, comet.length * fade);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      }
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} renderOrder={-2}>
      {/* Stretched sphere acts as a soft glowing streak without sharp edges */}
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial 
        color="#e0e7ff" 
        transparent 
        opacity={0.4} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </instancedMesh>
  );
}
