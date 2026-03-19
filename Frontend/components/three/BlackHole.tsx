'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  // Always face camera behavior is handled in JS (quaternion copy)
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uCameraPos;
varying vec3 vWorldPosition;

// Noise functions for accretion disk
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float f = 0.0;
  float w = 0.5;
  for (int i=0; i<4; i++) {
    f += w * noise(p);
    p *= 2.0;
    w *= 0.5;
  }
  return f;
}

void main() {
  // Ray origin is the camera
  vec3 ro = uCameraPos;
  // Ray direction from camera to the world position of the plane fragment
  vec3 rd = normalize(vWorldPosition - uCameraPos);
  
  vec3 rayPos = ro;
  vec3 rayDir = rd;
  
  float rs = 1.0; // Schwarzschild radius
  float diskInner = rs * 1.8;
  float diskOuter = rs * 4.4;
  
  vec4 color = vec4(0.0);
  float alphaMul = 1.0;
  
  // Raymarching loop (Runge-Kutta / Euler gravity integration)
  float stepSize = 0.08;
  
  for(int i=0; i<80; i++) {
    float r = length(rayPos);
    
    // Hit Event Horizon
    if(r < rs) {
      // Pure black hole
      color.rgb += vec3(0.0);
      color.a = 1.0; 
      alphaMul = 0.0;
      break;
    }
    
    // Check Accretion Disk (Y=0 plane crossing)
    // If ray crosses the XZ plane in this step
    if (rayPos.y * (rayPos.y + rayDir.y * stepSize) < 0.0) {
      // Calculate intersection exact point
      float t = -rayPos.y / rayDir.y;
      vec3 hitHit = rayPos + rayDir * t;
      float rDisk = length(hitHit.xz);
      
      if(rDisk > diskInner && rDisk < diskOuter) {
        // Disk Texture / Density
        float angle = atan(hitHit.z, hitHit.x);
        float distNorm = (rDisk - diskInner) / (diskOuter - diskInner);
        
        float n = fbm(vec2(rDisk * 3.5, angle * 3.0 - uTime * 0.8));
        float ringNoise = fbm(vec2(rDisk * 8.0, 0.0)); // Adds circular bands
        float density = n * 0.6 + ringNoise * 0.4;
        
        // Doppler Beaming: Approaching is left (assume spin around Y), meaning hitHit.x < 0
        float doppler = mix(0.4, 1.8, smoothstep(diskOuter, -diskOuter, hitHit.x));
        
        // Blackbody Temperature Mapping
        // Inner edge: white-hot -> mid: amber -> outer: deep red-orange
        float temp = 1.0 - smoothstep(0.0, 1.0, distNorm);
        vec3 colA = vec3(0.6, 0.15, 0.05); // Outer Red
        vec3 colB = vec3(1.0, 0.6, 0.2);   // Mid Amber
        vec3 colC = vec3(1.0, 0.98, 0.85); // Inner White
        
        vec3 baseC = mix(colA, mix(colB, colC, smoothstep(0.4, 1.0, temp)), temp);
        
        // Edge fading for smooth blending
        float fade = smoothstep(0.0, 0.15, distNorm) * smoothstep(1.0, 0.85, distNorm);
        
        vec4 c = vec4(baseC * temp * doppler * density * 2.5, density * fade * 0.9);
        
        // Accumulate Alpha
        color.rgb += c.rgb * c.a * alphaMul;
        color.a += c.a * alphaMul;
        alphaMul *= (1.0 - c.a);
      }
    }
    
    if (alphaMul < 0.01) break;

    // Einstein Deflection
    // Acceleration a = -1.5 * rs * L^2 / r^5 * position
    // We approximate it visually mapping forces:
    float r2 = dot(rayPos, rayPos);
    vec3 force = -rayPos * (1.2 * rs / (r2 * sqrt(r2))); 
    rayDir = normalize(rayDir + force * stepSize);
    rayPos += rayDir * stepSize;
    
    // Escaped the system bound
    if (r > 15.0) break;
  }

  // Discard fragments that hit absolutely nothing (perfect transparency)
  if (color.a < 0.01) discard;

  gl_FragColor = color;
}
`;

function RaymarchedBlackHole() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCameraPos: { value: new THREE.Vector3() },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      // Keep the plane strictly facing the camera to act as a 3D window for the shader
      meshRef.current.quaternion.copy(camera.quaternion);
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uCameraPos.value.copy(camera.position);
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Plane huge enough to cover the lensing math entirely */}
      <planeGeometry args={[28, 28]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={true}
        // DoubleSide ensure it renders from any angle
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
}

// ─── POLAR JETS ───────────────────────────────────────────────

const jetVertexShader = `
uniform float uTime;
attribute float delay;
attribute float speed;
attribute float side;

varying float vLifetime;

void main() {
  float maxHeight = 7.0;
  // Compute Y based on modulo to stream endlessly
  float yRaw = position.y * side + uTime * speed + delay;
  float yPos = mod(yRaw, maxHeight) * side;

  // XZ spread expands as Y gets further from 0 to form a cone
  vec3 currentPos = vec3(
    position.x * (1.0 + abs(yPos)*1.2),
    yPos,
    position.z * (1.0 + abs(yPos)*1.2)
  );

  vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Particle size attenuates with distance
  gl_PointSize = (40.0 / -mvPosition.z);

  // Lifetime dictates crossface/opacity: 1 near origin, 0 at tips
  vLifetime = 1.0 - (abs(yPos) / maxHeight);
}
`;

const jetFragmentShader = `
varying float vLifetime;

void main() {
  // Soft circle particle
  vec2 coords = gl_PointCoord - vec2(0.5);
  float dist = length(coords);
  if (dist > 0.5) discard;

  float strength = 1.0 - (dist * 2.0);
  
  // Color from white at base to purple at tip
  vec3 colorBase = vec3(1.0, 1.0, 1.0);
  vec3 colorTip = vec3(0.65, 0.54, 0.98); // #a78bfa
  vec3 colorMix = mix(colorTip, colorBase, vLifetime * vLifetime);

  gl_FragColor = vec4(colorMix, strength * vLifetime * 0.4);
}
`;

function PolarJets() {
  const pointsRef = useRef<THREE.Points>(null);

  const particlesConfig = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    const speeds = new Float32Array(count);
    const sides = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Narrow central cluster for the jet origin
      positions[i * 3 + 0] = (Math.random() - 0.5) * 0.2; // x
      positions[i * 3 + 1] = 0.5; // Starts just above event horizon
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2; // z
      
      delays[i] = Math.random() * 5.0;
      speeds[i] = 2.0 + Math.random() * 2.5;
      sides[i] = Math.random() > 0.5 ? 1 : -1;
    }

    return { positions, delays, speeds, sides };
  }, []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesConfig.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-delay"
          args={[particlesConfig.delays, 1]}
        />
        <bufferAttribute
          attach="attributes-speed"
          args={[particlesConfig.speeds, 1]}
        />
        <bufferAttribute
          attach="attributes-side"
          args={[particlesConfig.sides, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={jetVertexShader}
        fragmentShader={jetFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function BlackHole() {
  return (
    <group>
      <RaymarchedBlackHole />
      <PolarJets />
    </group>
  );
}
