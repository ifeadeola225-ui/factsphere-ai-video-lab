import {useFrame, useThree} from '@react-three/fiber';
import {
  BloomEffect,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  VignetteEffect,
} from 'postprocessing';
import React, {useEffect, useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import type {Vec3} from './camera';

export type FxProps = {
  /** World point to keep in focus (the acting character's head). Omit to disable DOF. */
  focus?: Vec3;
  /** Blur strength. Brief section 0.2: strong, about 3–4. */
  bokehScale?: number;
  /** Depth range kept sharp around the focus point, in world units. */
  focusRange?: number;
  bloom?: number; // intensity
  vignette?: number; // darkness
  parts?: {dof?: boolean; bloom?: boolean; vignette?: boolean};
  msaa?: number;
  hdr?: boolean;
};

/**
 * A3.4 post FX: depth of field, bloom (emissive only), vignette.
 * Our own composer instead of @react-three/postprocessing's, which never presents a frame
 * under Remotion's on-demand rendering. The useFrame below only RENDERS the frame that
 * Remotion's advance() asks for; nothing animates from it (A2.1 still holds).
 */
export const Fx: React.FC<FxProps> = ({
  focus,
  bokehScale = 3.5,
  focusRange = 1.5,
  bloom = 0.5,
  vignette = 0.4,
  parts = {},
  msaa = 4,
  hdr = true,
}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const useDof = Boolean(focus) && parts.dof !== false;

  const {composer, dof} = useMemo(() => {
    const c = new EffectComposer(gl, {
      multisampling: msaa,
      frameBufferType: hdr ? THREE.HalfFloatType : THREE.UnsignedByteType,
    });
    c.addPass(new RenderPass(scene, camera));
    let d: DepthOfFieldEffect | null = null;
    if (useDof) {
      d = new DepthOfFieldEffect(camera, {worldFocusRange: focusRange, bokehScale});
      d.target = new THREE.Vector3();
      c.addPass(new EffectPass(camera, d));
    }
    const finals = [];
    if (parts.bloom !== false)
      finals.push(new BloomEffect({luminanceThreshold: 0.85, luminanceSmoothing: 0.2, intensity: bloom, mipmapBlur: true}));
    if (parts.vignette !== false) finals.push(new VignetteEffect({offset: 0.3, darkness: vignette}));
    if (finals.length) c.addPass(new EffectPass(camera, ...finals));
    return {composer: c, dof: d};
  }, [gl, scene, camera, msaa, hdr, useDof, focusRange, bokehScale, bloom, vignette, parts.bloom, parts.vignette]);

  useEffect(() => () => composer.dispose(), [composer]);
  useLayoutEffect(() => composer.setSize(size.width, size.height), [composer, size.width, size.height]);
  // Focus point is frame-driven via props.
  useLayoutEffect(() => {
    if (dof && focus) (dof.target as THREE.Vector3).set(...focus);
  });

  // Priority 1 takes over rendering from R3F; called once per Remotion advance().
  useFrame((_, delta) => composer.render(delta), 1);
  return null;
};
