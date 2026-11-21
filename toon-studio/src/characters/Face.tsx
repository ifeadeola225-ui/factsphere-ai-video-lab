import React from 'react';
import * as THREE from 'three';
import {interpolate} from 'remotion';
import {mulberry32} from '../engine/rng';

// Face system: brief section 0.1 (small eyes with a highlight, thick brows, thin mouth, no nose).

export type Expression =
  | 'neutral'
  | 'smile'
  | 'happy'
  | 'smug'
  | 'worried'
  | 'shocked'
  | 'angry'
  | 'sad'
  | 'thinking';

type Euler4 = [number, number, number, THREE.EulerOrder];

/** Place a feature on the head sphere surface, facing outward. yaw/pitch in radians. */
export const onHead = (yaw: number, pitch: number, r = 1, lift = 0.012) => ({
  position: [
    (r + lift) * Math.cos(pitch) * Math.sin(yaw),
    (r + lift) * Math.sin(pitch),
    (r + lift) * Math.cos(pitch) * Math.cos(yaw),
  ] as [number, number, number],
  rotation: [-pitch, yaw, 0, 'YXZ'] as Euler4,
});

const INK = '#160502';
const inkMat = new THREE.MeshBasicMaterial({color: INK});
const whiteMat = new THREE.MeshBasicMaterial({color: '#FFFFFF'});
const mouthInMat = new THREE.MeshBasicMaterial({color: '#7A1E1E'});

// Shared geometries
const eyeGeo = new THREE.SphereGeometry(1, 24, 16);
const dotGeo = new THREE.CircleGeometry(1, 16);
const lidGeo = new THREE.CapsuleGeometry(0.03, 0.15, 4, 8);

type Spec = {
  eyes: 'open' | 'lidded' | 'closed' | 'happy' | 'wide';
  brow: {tilt: number; lift: number; arch: number}; // tilt>0 = inner ends DOWN (angry); <0 = inner up (worried)
  mouth: 'flat' | 'smile' | 'grin' | 'frown' | 'o' | 'smirk' | 'wobble';
  look?: [number, number]; // pupil shift (yaw, pitch)
};

const SPECS: Record<Expression, Spec> = {
  neutral: {eyes: 'open', brow: {tilt: 0, lift: 0, arch: 0.6}, mouth: 'flat'},
  smile: {eyes: 'open', brow: {tilt: -0.05, lift: 0.02, arch: 0.8}, mouth: 'smile'},
  happy: {eyes: 'happy', brow: {tilt: -0.1, lift: 0.05, arch: 0.9}, mouth: 'grin'},
  smug: {eyes: 'lidded', brow: {tilt: 0.12, lift: 0, arch: 0.7}, mouth: 'smirk'},
  worried: {eyes: 'open', brow: {tilt: -0.45, lift: 0.04, arch: 0.3}, mouth: 'wobble'},
  shocked: {eyes: 'wide', brow: {tilt: -0.1, lift: 0.1, arch: 0.9}, mouth: 'o'},
  angry: {eyes: 'open', brow: {tilt: 0.55, lift: -0.04, arch: 0.2}, mouth: 'frown'},
  sad: {eyes: 'open', brow: {tilt: -0.35, lift: 0.0, arch: 0.4}, mouth: 'frown', look: [0, -0.05]},
  thinking: {eyes: 'open', brow: {tilt: 0.1, lift: 0.03, arch: 0.6}, mouth: 'flat', look: [0.06, 0.06]},
};

/** Curved stroke on the head (brows, mouths, closed eyes) as a torus arc. */
const Arc: React.FC<{
  yaw: number;
  pitch: number;
  radius: number;
  tube: number;
  arc: number; // radians of arc
  spin: number; // roll around the facing axis
  mat?: THREE.Material;
}> = ({yaw, pitch, radius, tube, arc, spin, mat = inkMat}) => {
  const p = onHead(yaw, pitch);
  return (
    <group position={p.position} rotation={p.rotation}>
      <mesh rotation={[0, 0, spin]} material={mat}>
        <torusGeometry args={[radius, tube, 8, 24, arc]} />
      </mesh>
    </group>
  );
};

/** Straight stroke on the head (closed eyes, flat mouth). */
const Bar: React.FC<{yaw: number; pitch: number; len: number; tube: number; spin?: number}> = ({yaw, pitch, len, tube, spin = 0}) => {
  const p = onHead(yaw, pitch);
  return (
    <group position={p.position} rotation={p.rotation}>
      <mesh rotation={[0, 0, Math.PI / 2 + spin]} material={inkMat}>
        <capsuleGeometry args={[tube, len, 4, 8]} />
      </mesh>
    </group>
  );
};

export type FaceProps = {
  expression: Expression;
  /** 0..1 blink amount (1 = closed). */
  blink?: number;
  /** Mouth open amount for talking 0..1. */
  talk?: number;
};

export const Face: React.FC<FaceProps> = ({expression, blink = 0, talk = 0}) => {
  const s = SPECS[expression];
  const EY = 0.07; // eye pitch
  const EX = 0.26; // eye yaw
  const lookY = s.look?.[0] ?? 0;
  const lookP = s.look?.[1] ?? 0;
  const sy = 1 - 0.9 * blink;

  const eyes = [-1, 1].map((side) => {
    const yaw = side * EX + lookY;
    const pitch = EY + lookP;
    const p = onHead(yaw, pitch, 1, 0.0);
    if (s.eyes === 'happy') {
      return <Arc key={side} yaw={side * EX} pitch={EY - 0.02} radius={0.075} tube={0.026} arc={Math.PI} spin={0} />;
    }
    if (s.eyes === 'closed' || blink > 0.85) {
      return <Bar key={side} yaw={side * EX} pitch={EY - 0.01} len={0.12} tube={0.022} />;
    }
    if (s.eyes === 'wide') {
      return (
        <group key={side} position={p.position} rotation={p.rotation}>
          <mesh material={whiteMat} position={[0, 0, 0.01]} scale={[0.15, 0.17 * sy, 1]}>
            <circleGeometry args={[1, 24]} />
          </mesh>
          <mesh material={inkMat} position={[0, 0, 0.008]} scale={[0.17, 0.19 * sy, 1]}>
            <circleGeometry args={[1, 24]} />
          </mesh>
          <mesh material={inkMat} position={[0, 0, 0.02]} scale={[0.045, 0.05 * sy, 1]} geometry={dotGeo} />
        </group>
      );
    }
    return (
      <group key={side} position={p.position} rotation={p.rotation}>
        <mesh material={inkMat} geometry={eyeGeo} scale={[0.085, 0.115 * sy, 0.03]} />
        {sy > 0.5 ? (
          <mesh material={whiteMat} geometry={dotGeo} position={[0.028, 0.04 * sy, 0.031]} scale={[0.025, 0.025, 1]} />
        ) : null}
        {s.eyes === 'lidded' ? (
          // flat upper lid: ink bar across the top half of the eye
          <mesh material={inkMat} geometry={lidGeo} position={[0, 0.02, 0.035]} rotation={[0, 0, Math.PI / 2 + side * 0.08]} />
        ) : null}
      </group>
    );
  });

  // Brows: thick arcs above the eyes; tilt rotates inner end down (angry) or up (worried)
  const brows = [-1, 1].map((side) => (
    <Arc
      key={`b${side}`}
      yaw={side * (EX + 0.02)}
      pitch={0.19 + s.brow.lift}
      radius={0.15}
      tube={0.05}
      arc={Math.PI * s.brow.arch * 0.75}
      spin={Math.PI / 2 - (Math.PI * s.brow.arch * 0.75) / 2 + side * s.brow.tilt}
    />
  ));

  // Mouth
  const MP = -0.25;
  let mouth: React.ReactNode;
  const openAmt = talk;
  if (s.mouth === 'o' || openAmt > 0.15) {
    const p = onHead(0, MP - 0.02);
    const k = s.mouth === 'o' ? 1 : openAmt;
    mouth = (
      <group position={p.position} rotation={p.rotation}>
        <mesh material={inkMat} position={[0, 0, 0.004]} scale={[0.085, 0.06 + 0.06 * k, 1]}>
          <circleGeometry args={[1, 24]} />
        </mesh>
        <mesh material={mouthInMat} position={[0, -0.005, 0.01]} scale={[0.06, 0.04 + 0.045 * k, 1]}>
          <circleGeometry args={[1, 24]} />
        </mesh>
      </group>
    );
  } else if (s.mouth === 'flat') {
    mouth = <Bar yaw={0} pitch={MP} len={0.14} tube={0.02} />;
  } else if (s.mouth === 'smile') {
    mouth = <Arc yaw={0} pitch={MP + 0.03} radius={0.11} tube={0.022} arc={Math.PI * 0.75} spin={Math.PI * 1.125} />;
  } else if (s.mouth === 'grin') {
    const p = onHead(0, MP + 0.01);
    mouth = (
      <group position={p.position} rotation={p.rotation}>
        <mesh material={inkMat} position={[0, 0, 0.004]} rotation={[0, 0, Math.PI]}>
          <circleGeometry args={[0.13, 24, 0, Math.PI]} />
        </mesh>
        <mesh material={mouthInMat} position={[0, -0.02, 0.01]} rotation={[0, 0, Math.PI]}>
          <circleGeometry args={[0.1, 24, 0, Math.PI]} />
        </mesh>
      </group>
    );
  } else if (s.mouth === 'smirk') {
    mouth = <Arc yaw={0.05} pitch={MP + 0.03} radius={0.12} tube={0.022} arc={Math.PI * 0.5} spin={Math.PI * 1.35} />;
  } else if (s.mouth === 'frown') {
    mouth = <Arc yaw={0} pitch={MP - 0.06} radius={0.11} tube={0.022} arc={Math.PI * 0.6} spin={Math.PI * 0.2} />;
  } else {
    // wobble: two short opposing arcs
    mouth = (
      <>
        <Arc yaw={-0.05} pitch={MP} radius={0.05} tube={0.018} arc={Math.PI * 0.8} spin={Math.PI * 0.1} />
        <Arc yaw={0.05} pitch={MP} radius={0.05} tube={0.018} arc={Math.PI * 0.8} spin={Math.PI * 1.1} />
      </>
    );
  }

  return (
    <group>
      {eyes}
      {brows}
      {mouth}
    </group>
  );
};

/** Blink amount 0..1 at this frame: every 2.8–4.2 s with a seeded offset, 6-frame close/open (A4.2). */
export const blinkAt = (frame: number, fps: number, seed: number) => {
  const rand = mulberry32(seed);
  let t = rand() * 1.5 * fps; // first blink offset
  while (t <= frame + 6) {
    if (frame >= t && frame <= t + 6) {
      return interpolate(frame, [t, t + 3, t + 6], [0, 1, 0]);
    }
    t += (2.8 + rand() * 1.4) * fps;
  }
  return 0;
};
