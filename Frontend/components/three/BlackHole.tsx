'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const photonVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;

const photonFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform float uTime;
  void main() {
    float f = 1.0 - abs(dot(normalize(vNormal), normalize(vViewDir)));
    // Sharp photon ring at exact silhouette
    float ring = pow(f, 7.0) * 2.5;
    // Asymmetric — brighter on one side
    float azimuth = atan(vNormal.z, vNormal.x);
    float doppler = 0.65 + 0.35 * sin(azimuth + 0.8);
    vec3 color = mix(
      vec3(1.0, 0.4, 1.0),   // blazing neon pink side
      vec3(0.5, 0.0, 0.8),   // deep purple dim side
      1.0 - doppler
    );
    gl_FragColor = vec4(color * ring * doppler * 2.0, ring);
  }
`;

const haloVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const haloFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float rim = 1.0 - abs(dot(normalize(vNormal), normalize(vViewDir)));
    float halo = pow(rim, 3.0) * 0.5;
    gl_FragColor = vec4(0.1, 0.05, 0.3, halo);
  }
`;

export function BlackHole() {
  const photonMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (photonMaterialRef.current) photonMaterialRef.current.uniforms.uTime.value += delta;
    
    timeRef.current += delta;
    
    if (groupRef.current) {
      // Billboard the group to perfectly face the camera
      const camPos = state.camera.position;
      const angleToCamera = Math.atan2(camPos.x, camPos.z);
      groupRef.current.rotation.y = angleToCamera;
    }
  });

  return (
    <group ref={groupRef}>
      {/* MESH A: Occlusion sphere (the void) */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[2.5, 128, 128]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* MESH B: Photon ring (inner strict rim glow shader) */}
      <mesh renderOrder={3}>
        <sphereGeometry args={[2.5, 128, 128]} />
        <shaderMaterial
          ref={photonMaterialRef}
          vertexShader={photonVertexShader}
          fragmentShader={photonFragmentShader}
          uniforms={{ uTime: { value: 0 } }}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
