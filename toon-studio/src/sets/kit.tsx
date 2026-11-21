import React from 'react';
import * as THREE from 'three';
import type {Anchor, Vec3} from '../engine/camera';
import type {Format} from '../engine/format';
import {Ink} from '../engine/Ink';
import {C} from '../engine/palette';
import {checkerTex, plasterTex, skyTex, textTex, woodTex} from '../engine/textures';
import {GRADIENT_SET, toonMat} from '../engine/toon';
import type {LightPreset} from '../engine/Stage';

// Shared set kit (A6). Conventions for every set:
// - the character zone is around the origin; interiors put the back wall at z = -6
// - ≥ 3 depth layers: foreground prop, character zone, back wall with detail
// - one window or opening to the outside
// - NO coplanar visible faces: stacked/inset surfaces keep ≥ 0.03 gap (LOCKED rule)

export type AnchorName = 'wide' | 'mid' | 'close' | 'low_fg' | 'high';
export type Anchors = Record<AnchorName, Record<Format, Anchor>>;

export type SetDef = {
  id: string;
  name: string;
  Component: React.FC;
  anchors: Anchors;
  light: LightPreset;
  background: string;
  fog?: {color: string; near: number; far: number};
};

/** Standard anchors around a character at the origin; `shift` moves the whole rig. */
export const makeAnchors = (shift: Vec3 = [0, 0, 0], extra: Partial<Anchors> = {}): Anchors => {
  const s = (a: Anchor): Anchor => ({
    ...a,
    pos: [a.pos[0] + shift[0], a.pos[1] + shift[1], a.pos[2] + shift[2]],
    target: [a.target[0] + shift[0], a.target[1] + shift[1], a.target[2] + shift[2]],
  });
  const base: Anchors = {
    wide: {
      '9x16': {pos: [0, 5.6, 19], target: [0, 4.2, -1], fov: 42},
      '16x9': {pos: [0, 5.2, 18], target: [0, 4.0, -1], fov: 40},
    },
    mid: {
      '9x16': {pos: [0.3, 5.1, 13.5], target: [0, 4.15, 0], fov: 33},
      '16x9': {pos: [1.4, 4.9, 14.5], target: [0.9, 3.9, 0], fov: 30},
    },
    close: {
      '9x16': {pos: [0.2, 5.4, 8.5], target: [0, 4.9, 0], fov: 30},
      '16x9': {pos: [0.8, 5.3, 8.5], target: [0.5, 4.8, 0], fov: 28},
    },
    low_fg: {
      '9x16': {pos: [-1.2, 1.6, 11], target: [0, 4.2, 0], fov: 34},
      '16x9': {pos: [-1.5, 1.6, 12], target: [0.5, 3.8, 0], fov: 32},
    },
    high: {
      '9x16': {pos: [0, 11, 14], target: [0, 2.5, -1], fov: 40},
      '16x9': {pos: [0, 10.5, 14], target: [0, 2.5, -1], fov: 38},
    },
  };
  const out = {} as Anchors;
  (Object.keys(base) as AnchorName[]).forEach((k) => {
    const src = extra[k] ?? base[k];
    out[k] = {'9x16': s(src['9x16']), '16x9': s(src['16x9'])};
  });
  return out;
};

export const T = (c: string) => toonMat(c);

/** Box with toon material and ink. */
export const Box: React.FC<{p: Vec3; s: Vec3; c: string; r?: Vec3; ink?: number; shadow?: boolean}> = ({p, s, c, r, ink = 0.025, shadow = true}) => (
  <mesh position={p} rotation={r} material={T(c)} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
    {ink > 0 ? <Ink w={ink} /> : null}
  </mesh>
);

export const Cyl: React.FC<{p: Vec3; r1: number; r2?: number; h: number; c: string; rot?: Vec3; ink?: number; seg?: number}> = ({
  p,
  r1,
  r2,
  h,
  c,
  rot,
  ink = 0.025,
  seg = 24,
}) => (
  <mesh position={p} rotation={rot} material={T(c)} castShadow receiveShadow>
    <cylinderGeometry args={[r1, r2 ?? r1, h, seg]} />
    {ink > 0 ? <Ink w={ink} /> : null}
  </mesh>
);

/** Emissive glow (lamp shades, screens, candles, beakers): bloom picks it up. */
export const Glow: React.FC<{children: React.ReactNode; p: Vec3; color: string; intensity?: number; r?: Vec3}> = ({children, p, color, intensity = 1.6, r}) => (
  <mesh position={p} rotation={r}>
    {children}
    <meshToonMaterial color={color} emissive={color} emissiveIntensity={intensity} gradientMap={GRADIENT_SET} />
  </mesh>
);

export type FloorKind = {wood: string} | {checker: [string, string]} | {plain: string};

export const Floor: React.FC<{kind: FloorKind; size?: number; repeat?: number}> = ({kind, size = 40, repeat = 6}) => {
  const map =
    'wood' in kind ? woodTex(kind.wood, [repeat, repeat], 7) : 'checker' in kind ? checkerTex(kind.checker[0], kind.checker[1], [repeat * 2, repeat * 2]) : undefined;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshToonMaterial map={map} color={'plain' in kind ? kind.plain : '#FFFFFF'} gradientMap={GRADIENT_SET} />
    </mesh>
  );
};

/** Back wall (z = -6) with optional wainscot, plus a left side wall. */
export const RoomShell: React.FC<{wall: string; side?: string; wainscot?: string; height?: number; sideX?: number}> = ({
  wall,
  side,
  wainscot,
  height = 14,
  sideX = -9,
}) => (
  <>
    <mesh position={[0, height / 2, -6]} receiveShadow>
      <planeGeometry args={[40, height]} />
      <meshToonMaterial map={plasterTex(wall, [5, 2.5])} gradientMap={GRADIENT_SET} />
    </mesh>
    {wainscot ? (
      <>
        <Box p={[0, 1.2, -5.94]} s={[40, 2.4, 0.1]} c={wainscot} ink={0} />
        <Box p={[0, 2.45, -5.84]} s={[40, 0.15, 0.3]} c={C.deskWood} ink={0.02} />
      </>
    ) : null}
    {side ? (
      <mesh position={[sideX, height / 2, 4]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[24, height]} />
        <meshToonMaterial map={plasterTex(side, [3, 2])} gradientMap={GRADIENT_SET} />
      </mesh>
    ) : null}
  </>
);

/** Window on the back wall: sky (in FRONT of the wall), rooftops, frame and sill. Group z ≈ -5.85. */
export const Window: React.FC<{p: Vec3; w?: number; h?: number; frame?: string; night?: boolean; rooftops?: boolean}> = ({
  p,
  w = 3.6,
  h = 3.2,
  frame = C.white,
  night = false,
  rooftops = true,
}) => (
  <group position={p}>
    <mesh position={[0, 0, -0.08]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={night ? skyTex('#1E2A55', '#4A5F9C', false) : skyTex('#7FBCEB', '#D6ECF8')} toneMapped={false} />
    </mesh>
    {rooftops
      ? [-0.33, -0.08, 0.19, 0.39].map((fx, i) => (
          <mesh key={i} position={[fx * w, -h * 0.37 + (i % 2) * 0.25, -0.05]} material={T(night ? ['#2E3A66', '#25305A'][i % 2] : ['#B9C6D6', '#A9B8CC'][i % 2])}>
            <boxGeometry args={[w * 0.22, h * 0.38 + (i % 3) * 0.4, 0.02]} />
          </mesh>
        ))
      : null}
    {[
      [0, h / 2 + 0.05, w + 0.3, 0.3],
      [0, -h / 2 - 0.05, w + 0.3, 0.3],
      [w / 2 + 0.05, 0, 0.3, h + 0.4],
      [-w / 2 - 0.05, 0, 0.3, h + 0.4],
      [0, 0, 0.14, h],
      [0, 0, w, 0.14],
    ].map(([x, y, ww, hh], i) => (
      <Box key={i} p={[x, y, 0]} s={[ww, hh, 0.25]} c={frame} ink={0.02} />
    ))}
    <Box p={[0, -h / 2 - 0.3, 0.25]} s={[w + 0.7, 0.18, 0.6]} c={frame} ink={0.02} />
  </group>
);

/** Door on a wall (closed). */
export const Door: React.FC<{p: Vec3; c?: string; frame?: string; rotY?: number; sign?: string}> = ({p, c = C.deskWood, frame = C.white, rotY = 0, sign}) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 2.6, 0.05]} s={[2.4, 5.2, 0.12]} c={c} ink={0.025} />
    <Box p={[0, 5.35, 0.08]} s={[2.9, 0.3, 0.2]} c={frame} ink={0.02} />
    <Box p={[-1.3, 2.6, 0.08]} s={[0.3, 5.2, 0.2]} c={frame} ink={0.02} />
    <Box p={[1.3, 2.6, 0.08]} s={[0.3, 5.2, 0.2]} c={frame} ink={0.02} />
    <mesh position={[0.85, 2.5, 0.18]} material={T(C.warmYellow)}>
      <sphereGeometry args={[0.12, 12, 10]} />
      <Ink w={0.015} />
    </mesh>
    {sign ? (
      <mesh position={[0, 4.3, 0.13]}>
        <planeGeometry args={[1.5, 0.55]} />
        <meshBasicMaterial map={textTex(sign, C.white, '#1E3A6E')} toneMapped={false} />
      </mesh>
    ) : null}
  </group>
);

export const Plant: React.FC<{p: Vec3; scale?: number; pot?: string}> = ({p, scale = 1, pot = C.burgundy}) => (
  <group position={p} scale={scale}>
    <Cyl p={[0, 0.5, 0]} r1={0.55} r2={0.42} h={1.0} c={pot} ink={0.03} seg={20} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const a = (i / 7) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.sin(a) * 0.35, 1.5 + (i % 3) * 0.25, Math.cos(a) * 0.35]} material={T('#4C8A4A')} castShadow>
          <sphereGeometry args={[0.3, 12, 10]} />
          <Ink w={0.025} />
        </mesh>
      );
    })}
  </group>
);

/** Hanging ceiling lamp: cord, glowing shade and a warm point light. */
export const PendantLamp: React.FC<{p: Vec3; color?: string; light?: number}> = ({p, color = '#FFC94A', light = 5}) => (
  <group position={p}>
    <Cyl p={[0, 1.5, 0]} r1={0.03} h={3} c={'#160502'} ink={0} />
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.35, 0.75, 0.6, 24, 1, true]} />
      <meshToonMaterial color={C.navy} gradientMap={GRADIENT_SET} side={THREE.DoubleSide} />
      <Ink w={0.02} />
    </mesh>
    <Glow p={[0, -0.25, 0]} color={color} intensity={2}>
      <sphereGeometry args={[0.22, 16, 12]} />
    </Glow>
    <pointLight position={[0, -0.6, 0]} color={'#FFC98A'} intensity={light} distance={12} decay={1.5} />
  </group>
);

export const Chair: React.FC<{p: Vec3; c?: string; rotY?: number}> = ({p, c = C.deskWood, rotY = 0}) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 1.1, 0]} s={[1.2, 0.15, 1.2]} c={c} />
    <Box p={[0, 2.0, -0.55]} s={[1.2, 1.7, 0.12]} c={c} />
    {[
      [-0.5, -0.5],
      [0.5, -0.5],
      [-0.5, 0.5],
      [0.5, 0.5],
    ].map(([x, z], i) => (
      <Box key={i} p={[x, 0.52, z]} s={[0.12, 1.05, 0.12]} c={c} ink={0.015} />
    ))}
  </group>
);

/** Flat painted backdrop far away (sky + hills or skyline) for exteriors. */
export const SkyBackdrop: React.FC<{top?: string; bottom?: string; z?: number; w?: number; h?: number}> = ({top = '#7FBCEB', bottom = '#D6ECF8', z = -70, w = 260, h = 110}) => (
  <mesh position={[0, h / 2 - 12, z]}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={skyTex(top, bottom)} toneMapped={false} fog={false} />
  </mesh>
);

/** A sign card with text (canvas texture), on a thin board. */
export const Sign: React.FC<{p: Vec3; text: string; w?: number; h?: number; bg?: string; fg?: string; r?: Vec3}> = ({
  p,
  text,
  w = 2,
  h = 0.7,
  bg = C.cream,
  fg = '#1E3A6E',
  r,
}) => (
  <group position={p} rotation={r}>
    <Box p={[0, 0, 0]} s={[w + 0.12, h + 0.12, 0.08]} c={C.deskWood} ink={0.02} />
    <mesh position={[0, 0, 0.05]}>
      <planeGeometry args={[w, h]} />
      <meshToonMaterial map={textTex(text, bg, fg)} gradientMap={GRADIENT_SET} />
    </mesh>
  </group>
);
