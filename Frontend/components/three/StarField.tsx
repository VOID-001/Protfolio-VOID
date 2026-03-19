'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COUNT = 3000;

function StarField() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, opacities } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const ops = new Float32Array(STAR_COUNT);
    let count = 0;

    // Rejection sampling for uniform sphere distribution
    while (count < STAR_COUNT) {
      const x = (Math.random() - 0.5) * 160;
      const y = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 160;
      const len = Math.sqrt(x * x + y * y + z * z);

      if (len < 80 && len > 5) {
        pos[count * 3] = x;
        pos[count * 3 + 1] = y;
        pos[count * 3 + 2] = z;
        ops[count] = 0.3 + Math.random() * 0.7;
        count++;
      }
    }

    return { positions: pos, opacities: ops };
  }, []);

  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute float aOpacity;
        varying float vOpacity;

        void main() {
          vOpacity = aOpacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float size = 1.5 * (300.0 / -mvPosition.z);
          gl_PointSize = clamp(size, 0.3, 2.5);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vOpacity;
        uniform float uTime;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float twinkle = sin(uTime * 2.0 + vOpacity * 100.0) * 0.15 + 0.85;
          float softEdge = 1.0 - smoothstep(0.3, 0.5, dist);
          gl_FragColor = vec4(0.91, 0.94, 1.0, vOpacity * twinkle * softEdge);
        }
      `,
      transparent: true,
      depthWrite: false,
    }),
    []
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aOpacity"
          args={[opacities, 1]}
        />
      </bufferGeometry>
      <shaderMaterial ref={materialRef} {...shaderArgs} />
    </points>
  );
}

export default StarField;
