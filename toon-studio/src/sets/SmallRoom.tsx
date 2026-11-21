import React from 'react';
import * as THREE from 'three';
import type {Anchor} from '../engine/camera';
import type {Format} from '../engine/format';
import {Ink} from '../engine/Ink';
import {C} from '../engine/palette';
import {mulberry32} from '../engine/rng';
import {plasterTex, skyTex, woodTex} from '../engine/textures';
import {GRADIENT_SET, toonMat} from '../engine/toon';

// Small room / home office. Character zone is around the origin; back wall at z = -6.
// Depth layers (A6): foreground plant, character zone, desk + shelf, back wall with window.

export const SMALL_ROOM_ANCHORS: Record<'wide' | 'mid' | 'close' | 'low_fg' | 'high', Record<Format, Anchor>> = {
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

const T = (c: string) => toonMat(c);

const Book: React.FC<{p: [number, number, number]; h: number; w: number; color: string; tilt?: number}> = ({p, h, w, color, tilt = 0}) => (
  <mesh position={[p[0], p[1] + h / 2, p[2]]} rotation={[0, 0, tilt]} material={T(color)} castShadow>
    <boxGeometry args={[w, h, 0.55]} />
    <Ink w={0.018} />
  </mesh>
);

const Shelf: React.FC<{position: [number, number, number]}> = ({position}) => {
  const r = mulberry32(42);
  const colors = [C.burgundy, C.teal, C.warmYellow, C.navy, C.turquoise, C.earth, C.cream];
  const rows = [0.15, 1.65, 3.15];
  return (
    <group position={position}>
      {/* frame */}
      <mesh position={[0, 2.3, 0]} material={T(C.deskWood)} castShadow receiveShadow>
        <boxGeometry args={[3.2, 4.6, 0.8]} />
        <Ink w={0.03} />
      </mesh>
      <mesh position={[0, 2.3, 0.12]} material={T('#5E3A22')}>
        <boxGeometry args={[2.9, 4.3, 0.6]} />
      </mesh>
      {rows.map((y, ri) => {
        let x = -1.3;
        const books = [];
        while (x < 1.15) {
          const w = 0.16 + r() * 0.12;
          const h = 0.85 + r() * 0.45;
          books.push(<Book key={x} p={[x + w / 2, y + 0.1, 0.25]} h={h} w={w} color={colors[Math.floor(r() * colors.length)]} tilt={r() < 0.1 ? 0.25 : 0} />);
          x += w + 0.03;
        }
        return (
          <group key={ri}>
            <mesh position={[0, y + 0.05, 0.2]} material={T(C.deskWood)} receiveShadow>
              <boxGeometry args={[2.9, 0.1, 0.65]} />
            </mesh>
            {books}
          </group>
        );
      })}
    </group>
  );
};

const Desk: React.FC<{position: [number, number, number]}> = ({position}) => (
  <group position={position}>
    <mesh position={[0, 2.35, 0]} material={T(C.deskWood)} castShadow receiveShadow>
      <boxGeometry args={[4.2, 0.22, 1.8]} />
      <Ink w={0.03} />
    </mesh>
    {[
      [-1.9, -0.7],
      [1.9, -0.7],
      [-1.9, 0.7],
      [1.9, 0.7],
    ].map(([x, z], i) => (
      <mesh key={i} position={[x, 1.12, z]} material={T('#6E4428')} castShadow>
        <boxGeometry args={[0.18, 2.25, 0.18]} />
      </mesh>
    ))}
    {/* lamp: base, arm, glowing shade (emissive so bloom picks it up) */}
    <mesh position={[1.3, 2.55, -0.2]} material={T(C.navy)} castShadow>
      <cylinderGeometry args={[0.3, 0.35, 0.18, 20]} />
      <Ink w={0.02} />
    </mesh>
    <mesh position={[1.3, 3.2, -0.2]} material={T(C.navy)}>
      <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
    </mesh>
    <mesh position={[1.3, 3.9, -0.2]} castShadow>
      <cylinderGeometry args={[0.3, 0.55, 0.55, 24, 1, true]} />
      <meshToonMaterial color={C.warmYellow} emissive={'#FFC94A'} emissiveIntensity={1.6} gradientMap={GRADIENT_SET} side={THREE.DoubleSide} />
      <Ink w={0.02} />
    </mesh>
    <pointLight position={[1.3, 3.7, -0.2]} color={'#FFC98A'} intensity={6} distance={9} decay={1.6} />
    {/* papers + mug */}
    <mesh position={[-0.6, 2.48, 0.1]} rotation={[0, 0.2, 0]} material={T(C.white)}>
      <boxGeometry args={[0.9, 0.04, 1.1]} />
      <Ink w={0.012} />
    </mesh>
    <mesh position={[-1.4, 2.7, 0.3]} material={T(C.burgundy)} castShadow>
      <cylinderGeometry args={[0.2, 0.18, 0.45, 16]} />
      <Ink w={0.02} />
    </mesh>
  </group>
);

const Window: React.FC<{position: [number, number, number]}> = ({position}) => (
  <group position={position}>
    {/* sky + distant rooftops seen through the window */}
    {/* sky sits 0.07 in FRONT of the wall plane (window group is at z -5.85, wall at -6) to avoid z-fighting flicker */}
    <mesh position={[0, 0, -0.08]}>
      <planeGeometry args={[3.6, 3.2]} />
      <meshBasicMaterial map={skyTex('#7FBCEB', '#D6ECF8')} toneMapped={false} />
    </mesh>
    {[-1.2, -0.3, 0.7, 1.4].map((x, i) => (
      <mesh key={i} position={[x, -1.2 + (i % 2) * 0.25, -0.05]} material={T(['#B9C6D6', '#A9B8CC'][i % 2])}>
        <boxGeometry args={[0.8, 1.2 + (i % 3) * 0.4, 0.02]} />
      </mesh>
    ))}
    {/* frame + cross bars */}
    {[
      [0, 1.65, 3.9, 0.3],
      [0, -1.65, 3.9, 0.3],
      [1.9, 0, 0.3, 3.6],
      [-1.9, 0, 0.3, 3.6],
      [0, 0, 0.14, 3.2],
      [0, 0, 3.6, 0.14],
    ].map(([x, y, w, h], i) => (
      <mesh key={i} position={[x, y, 0]} material={T(C.white)} castShadow>
        <boxGeometry args={[w, h, 0.25]} />
        <Ink w={0.02} />
      </mesh>
    ))}
    {/* sill */}
    <mesh position={[0, -1.9, 0.25]} material={T(C.white)}>
      <boxGeometry args={[4.3, 0.18, 0.6]} />
      <Ink w={0.02} />
    </mesh>
  </group>
);

const Plant: React.FC<{position: [number, number, number]; scale?: number}> = ({position, scale = 1}) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.5, 0]} material={T(C.burgundy)} castShadow>
      <cylinderGeometry args={[0.55, 0.42, 1.0, 20]} />
      <Ink w={0.03} />
    </mesh>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const a = (i / 7) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.sin(a) * 0.35, 1.5 + (i % 3) * 0.25, Math.cos(a) * 0.35]} rotation={[Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6]} material={T('#4C8A4A')} castShadow>
          <sphereGeometry args={[0.3, 12, 10]} />
          <Ink w={0.025} />
        </mesh>
      );
    })}
  </group>
);

export const SmallRoom: React.FC<{showFgPlant?: boolean}> = ({showFgPlant = true}) => (
  <group>
    {/* floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshToonMaterial map={woodTex(C.floorWood, [5, 5], 7)} gradientMap={GRADIENT_SET} />
    </mesh>
    {/* rug under the character */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.5]} receiveShadow>
      <circleGeometry args={[3.2, 48]} />
      <meshToonMaterial color={C.burgundy} gradientMap={GRADIENT_SET} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0.5]} receiveShadow>
      <ringGeometry args={[2.6, 2.8, 48]} />
      <meshToonMaterial color={C.warmYellow} gradientMap={GRADIENT_SET} />
    </mesh>
    {/* back wall: plaster above, wood wainscot below */}
    <mesh position={[0, 7, -6]} receiveShadow>
      <planeGeometry args={[30, 14]} />
      <meshToonMaterial map={plasterTex(C.wallButter, [5, 2.5])} gradientMap={GRADIENT_SET} />
    </mesh>
    <mesh position={[0, 1.2, -5.95]} receiveShadow material={T(C.officeWood)}>
      <boxGeometry args={[30, 2.4, 0.1]} />
    </mesh>
    <mesh position={[0, 2.45, -5.85]} material={T(C.deskWood)}>
      <boxGeometry args={[30, 0.15, 0.3]} />
      <Ink w={0.02} />
    </mesh>
    {/* side wall (left) */}
    <mesh position={[-9, 7, 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[20, 14]} />
      <meshToonMaterial map={plasterTex(C.wallBlush, [3, 2])} gradientMap={GRADIENT_SET} />
    </mesh>
    <Window position={[2.6, 5.6, -5.85]} />
    <Shelf position={[-4.2, 0, -5.4]} />
    <Desk position={[4.2, 0, -3.6]} />
    {/* framed picture */}
    <group position={[-1.2, 6.2, -5.9]}>
      <mesh material={T(C.deskWood)}>
        <boxGeometry args={[1.6, 1.2, 0.12]} />
        <Ink w={0.02} />
      </mesh>
      <mesh position={[0, 0, 0.07]} material={T(C.turquoise)}>
        <planeGeometry args={[1.3, 0.9]} />
      </mesh>
      <mesh position={[0.2, -0.15, 0.08]} material={T(C.warmYellow)}>
        <circleGeometry args={[0.2, 20]} />
      </mesh>
    </group>
    <Plant position={[-6.5, 0, -3.5]} scale={1.3} />
    {showFgPlant ? <Plant position={[-3.6, 0, 6.5]} scale={1.4} /> : null}
  </group>
);
