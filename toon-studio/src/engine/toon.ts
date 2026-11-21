import * as THREE from 'three';

/**
 * Toon gradient map. `smooth` uses linear filtering for the reference video's
 * soft head shading; stepped (nearest) is used for sets.
 */
export const makeToonGradient = (steps: number[], smooth = false) => {
  const data = new Uint8Array(steps.length * 4);
  steps.forEach((v, i) => {
    const c = Math.round(v * 255);
    data.set([c, c, c, 255], i * 4);
  });
  const tex = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  const f = smooth ? THREE.LinearFilter : THREE.NearestFilter;
  tex.minFilter = f;
  tex.magFilter = f;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
};

// Shared module-level gradients (one instance each).
export const GRADIENT_CHAR = makeToonGradient([0.8, 0.9, 1.0], true); // soft, per section 0.1
export const GRADIENT_SET = makeToonGradient([0.74, 0.88, 1.0]); // gentle 3-step

const cache = new Map<string, THREE.MeshToonMaterial>();

/** Cached toon material, so identical colors share one material. */
export const toonMat = (
  color: string,
  kind: 'char' | 'set' = 'set',
  extra: Partial<THREE.MeshToonMaterialParameters> = {},
) => {
  const key = `${color}|${kind}|${JSON.stringify(extra)}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({
      color,
      gradientMap: kind === 'char' ? GRADIENT_CHAR : GRADIENT_SET,
      ...extra,
    });
    cache.set(key, m);
  }
  return m;
};

/** Outline thickness for characters: about 4% of head radius (brief section 0.1). */
export const OUTLINE_RATIO = 0.04;
