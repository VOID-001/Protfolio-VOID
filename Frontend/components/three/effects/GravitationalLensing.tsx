import { Effect } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import React, { forwardRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const fragmentShader = `
  uniform vec2 uCenter;
  uniform float uStrength;
  uniform float uRadius;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 toCenter = uCenter - uv;
    float dist = length(toCenter);

    float warpFactor = uStrength * smoothstep(uRadius, uRadius * 0.3, dist) / (dist * dist * 8.0 + 0.001);
    warpFactor = clamp(warpFactor, 0.0, 0.06);

    if (dist < uRadius * 0.22) {
      outputColor = vec4(0.012, 0.004, 0.055, 1.0);
      return;
    }

    vec2 warpedUV = uv + normalize(toCenter) * warpFactor;
    warpedUV = clamp(warpedUV, 0.0, 1.0);

    outputColor = texture2D(inputBuffer, warpedUV);
  }
`;

class LensingEffectImpl extends Effect {
  constructor() {
    super('GravitationalLensingEffect', fragmentShader, {
      uniforms: new Map<string, Uniform<any>>([
        ['uCenter', new Uniform(new Vector2(0.5, 0.5))],
        ['uStrength', new Uniform(0.012)],
        ['uRadius', new Uniform(0.28)]
      ])
    });
  }
}

export const GravitationalLensing = forwardRef(function GravitationalLensing(props, ref) {
  const effect = useMemo(() => new LensingEffectImpl(), []);
  const { camera } = useThree();
  const vec = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame(() => {
    vec.set(0, 0, 0);
    vec.project(camera);
    const x = (vec.x + 1) / 2;
    const y = (vec.y + 1) / 2;
    effect.uniforms.get('uCenter')!.value.set(x, y);
  });

  // @ts-ignore - primitive doesn't accept ref natively from postprocessing wrappers simply
  return <primitive ref={ref} object={effect} dispose={null} />;
});
