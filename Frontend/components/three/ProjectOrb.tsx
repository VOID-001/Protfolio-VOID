'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from '@/hooks/useSceneStore';
import type { Project } from '@/lib/types';

const PLANET_COLORS: Record<string, string> = {
  purple: '#c084fc', blue: '#60a5fa', green: '#4ade80', red: '#f87171',
  orange: '#fb923c', yellow: '#facc15', cyan: '#22d3ee', magenta: '#e879f9',
  white: '#e2e8f0', silver: '#a1a1aa', gold: '#fcd34d', rose: '#fb7185',
  teal: '#2dd4bf', indigo: '#818cf8', violet: '#a78bfa', crimson: '#f43f5e',
  emerald: '#34d399', sapphire: '#38bdf8', amethyst: '#d8b4fe', obsidian: '#475569',
};

const ORBIT_CONFIGS = [
  { rx: 4.0, ry: 2.8, inc: 0.55, speed: 0.14, py: 0.02, pz: 0.005 },
  { rx: 5.5, ry: 3.5, inc: 0.45, speed: 0.09, py: -0.015, pz: -0.008 },
  { rx: 7.0, ry: 4.5, inc: 0.35, speed: 0.06, py: 0.01, pz: 0.004 },
];

// Photon-ring style glow shader — same approach as BlackHole.tsx
const glowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform vec3 uColor;
  uniform float uIntensity;
  void main() {
    float f = 1.0 - abs(dot(normalize(vNormal), normalize(vViewDir)));
    
    // Sharp photon-ring style rim glow (like the black hole)
    float ring = pow(f, 5.0) * 2.5;
    
    // Softer outer halo for atmosphere
    float halo = pow(f, 2.5) * 0.4;
    
    float glow = (ring + halo) * uIntensity;
    
    // Brighter core, deeper edge color variation
    vec3 brightColor = uColor + vec3(0.15);
    vec3 deepColor = uColor * 0.6;
    vec3 finalColor = mix(deepColor, brightColor, ring / (ring + 0.5));
    
    gl_FragColor = vec4(finalColor * glow, glow);
  }
`;

export function ProjectOrb({ project, index, isMobile }: { project: Project; index: number; isMobile?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowMatRef = useRef<THREE.ShaderMaterial>(null);
  
  const tier = project.orbitTier === 'A' ? 0 : project.orbitTier === 'B' ? 1 : 2;
  const config = ORBIT_CONFIGS[tier];
  
  const curve = useMemo(() => new THREE.EllipseCurve(0, 0, config.rx, config.ry, 0, 2*Math.PI, false, 0), [config]);
  
  const progressRef = useRef(index / 10);

  const selectedProject = useSceneStore(s => s.selectedProject);
  const hoveredId = useSceneStore(s => s.hoveredProjectId);
  const setSelectedProject = useSceneStore(s => s.setSelectedProject);
  const setHoveredId = useSceneStore(s => s.setHoveredId);
  const isSelected = selectedProject?.id === project.id;
  const isHovered = hoveredId === project.id;
  
  const radius = 0.4 + (project.complexity / 10) * 0.2;
  const colorHex = PLANET_COLORS[project.planetColor || 'purple'] || '#c084fc';
  
  const glowColor = useMemo(() => new THREE.Color(colorHex), [colorHex]);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    // Only move the planet along the static orbit path
    if (!isSelected) {
      progressRef.current += config.speed * delta * 0.08;
    }
    const point = curve.getPoint((progressRef.current) % 1);
    
    if (innerGroupRef.current) {
      innerGroupRef.current.position.set(point.x, 0, point.y);
    }
    if (coreRef.current) {
      const spinDir = index % 2 === 0 ? 1 : -1;
      coreRef.current.rotation.y += spinDir * 0.6 * delta;
      
      const targetScale = isSelected ? 1.0 : (isHovered ? 0.7 : 0.5);
      tempVec.set(targetScale, targetScale, targetScale);
      coreRef.current.scale.lerp(tempVec, 0.1);

      if (isSelected) {
        coreRef.current.getWorldPosition(useSceneStore.getState().selectedPlanetPosition);
      }
    }
    if (materialRef.current) {
      const targetEmissive = isSelected ? 0.45 : isHovered ? 0.24 : 0.1;
      materialRef.current.emissiveIntensity += (targetEmissive - materialRef.current.emissiveIntensity) * 0.1;
    }
    // Animate glow intensity on hover/select
    if (glowMatRef.current) {
      const targetIntensity = isSelected ? 1.8 : (isHovered ? 1.2 : 0.7);
      glowMatRef.current.uniforms.uIntensity.value += (targetIntensity - glowMatRef.current.uniforms.uIntensity.value) * 0.08;
    }
  });

  const glowUniforms = useMemo(() => ({
    uColor: { value: glowColor },
    uIntensity: { value: 1.0 },
  }), [glowColor]);

  return (
    <group ref={groupRef} rotation={[config.inc, 0, 0]}>
      <group ref={innerGroupRef} 
             onPointerOver={(e) => { e.stopPropagation(); setHoveredId(project.id); document.body.style.cursor = 'pointer'; }}
             onPointerOut={(e) => { setHoveredId(null); document.body.style.cursor = 'grab'; }}
             onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}>
        
        {/* Core Sphere */}
        <mesh ref={coreRef} renderOrder={4}>
          <sphereGeometry args={[radius, isMobile ? 32 : 64, isMobile ? 32 : 64]} />
          {isMobile ? (
            <meshLambertMaterial ref={materialRef as any} color={colorHex} emissive={colorHex} emissiveIntensity={0.24} />
          ) : (
            <meshStandardMaterial 
              ref={materialRef}
              color={colorHex}
              roughness={0.68}
              metalness={0.12}
              emissive={colorHex}
              emissiveIntensity={0.1}
              onBeforeCompile={(shader) => {
                shader.vertexShader = shader.vertexShader.replace(
                  'void main() {',
                  `varying vec3 vLocalPos;
                  void main() {
                    vLocalPos = position;`
                );
                shader.fragmentShader = shader.fragmentShader.replace(
                  'void main() {',
                  `varying vec3 vLocalPos;
                  void main() {`
                );
                shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <map_fragment>',
                  `
                  #include <map_fragment>
                  
                  float j = 0.0;
                  vec3 q = vLocalPos * 4.0;
                  float a = 0.5;
                  for (int i = 0; i < 4; i++) {
                    j += a * fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
                    q *= 2.0;
                    a *= 0.5;
                  }
                  
                  vec3 pos = vLocalPos * 3.0; 
                  float f = sin(pos.x * 2.0 + sin(pos.y * 3.0 + j*2.0)) * sin(pos.y * 2.0 + pos.z * 2.0 - j);
                  f = f * 0.5 + 0.5;
                  
                  float c = fract(sin(dot(vLocalPos.xy + j, vec2(12.9898,78.233))) * 43758.5453);
                  float craters = smoothstep(0.85, 0.95, c) * 0.4;
                  
                  diffuseColor.rgb *= (0.6 + f * 0.4 - craters + j * 0.15);
                  `
                );
                shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <emissivemap_fragment>',
                  `
                  #include <emissivemap_fragment>
                  float viewDot = abs(dot(normalize(vNormal), normalize(vViewPosition)));
                  float atmFresnel = 1.0 - viewDot;
                  
                  float lightDot = dot(normalize(vNormal), normalize(vec3(8.0, 5.0, 6.0))); 
                  float terminator = smoothstep(-0.2, 0.2, lightDot) * smoothstep(0.5, 0.0, lightDot);
                  
                  totalEmissiveRadiance += diffuse * pow(atmFresnel, 3.0) * terminator * 2.0;
                  totalEmissiveRadiance += diffuse * pow(atmFresnel, 5.0) * smoothstep(0.0, -0.5, lightDot) * 0.3;
                  `
                );
              }}
            />
          )}
        </mesh>

        {/* Outer aura so CMS colors read clearly even against the purple scene */}
        <mesh renderOrder={3}>
          <sphereGeometry args={[radius * 1.85, isMobile ? 24 : 48, isMobile ? 24 : 48]} />
          <shaderMaterial
            ref={glowMatRef}
            uniforms={glowUniforms}
            vertexShader={glowVertexShader}
            fragmentShader={glowFragmentShader}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Floating Label */}
        <Html
          position={[0, radius * 1.8, 0]}
          center
          style={{
            opacity: isHovered || isSelected ? 1 : 0,
            transition: 'opacity 0.2s',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '11px',
            color: colorHex,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            letterSpacing: '0.08em',
            textShadow: `0 0 12px ${colorHex}`,
          }}>
          {project.title}
        </Html>
      </group>
    </group>
  );
}
