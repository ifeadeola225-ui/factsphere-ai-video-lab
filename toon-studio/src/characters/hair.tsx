import React from 'react';
import {Ink} from '../engine/Ink';
import {toonMat} from '../engine/toon';
import type {Look} from './cast';

// Hair and facial hair. Head-local space: head sphere radius 1 at the origin, face toward +z.

const FRINGE: [number, number, number][] = [
  // [yaw around head, tilt down, size]
  [-1.25, 0.9, 0.85], [-0.85, 0.8, 1.0], [-0.42, 0.7, 1.05], [0.0, 0.66, 1.1], [0.42, 0.7, 1.0], [0.85, 0.8, 0.95], [1.25, 0.9, 0.8],
  [2.2, 1.1, 0.9], [-2.2, 1.1, 0.9], [3.14, 1.15, 0.9],
];

const Cap: React.FC<{color: string; cover?: number; tilt?: number}> = ({color, cover = 0.36, tilt = -0.42}) => (
  <group rotation={[tilt, 0, 0]}>
    <mesh material={toonMat(color, 'char')} castShadow>
      <sphereGeometry args={[1.035, 40, 20, 0, Math.PI * 2, 0, Math.PI * cover]} />
      <Ink w={0.035} />
    </mesh>
  </group>
);

const Fringe: React.FC<{color: string; scale?: number}> = ({color, scale = 1}) => {
  const m = toonMat(color, 'char');
  return (
    <group rotation={[-0.42, 0, 0]}>
      {FRINGE.map(([yaw, tilt, s0], i) => {
        const s = s0 * scale;
        return (
          <group key={i} rotation={[0, yaw, 0]}>
            <group position={[0, 0.44, 0.93]} rotation={[tilt + 0.9, 0, i % 2 ? 0.25 : -0.25]}>
              <mesh material={m} position={[0, 0.12 * s, 0]} castShadow>
                <coneGeometry args={[0.15 * s, 0.34 * s, 8]} />
                <Ink w={0.03} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};

const CLOSED_HATS = new Set(['beanie', 'cap', 'chef']);

export const Hair: React.FC<{look: Look}> = ({look}) => {
  const c = look.hairColor;
  // hair would poke through a closed hat: show only side/back hair styles under one
  if (look.hat && CLOSED_HATS.has(look.hat) && !['tufts', 'long'].includes(look.hair)) return null;
  const m = toonMat(c, 'char');
  switch (look.hair) {
    case 'none':
      return null;
    case 'swoop':
      // ODD: messy fringe + one tall tuft sweeping forward
      return (
        <>
          <Cap color={c} />
          <Fringe color={c} />
          <group rotation={[-0.42, 0, 0]}>
            <group position={[0.15, 0.98, 0.1]} rotation={[0.85, 0.1, -0.2]}>
              <mesh material={m} position={[0, 0.3, 0]} castShadow>
                <coneGeometry args={[0.2, 0.75, 10]} />
                <Ink w={0.032} />
              </mesh>
            </group>
          </group>
        </>
      );
    case 'spiky':
      return (
        <>
          <Cap color={c} />
          <Fringe color={c} scale={1.15} />
          <group rotation={[-0.42, 0, 0]}>
            {[-0.6, -0.2, 0.2, 0.6].map((a, i) => (
              <group key={i} rotation={[0, a * 1.4, 0]}>
                <mesh material={m} position={[0, 1.0, 0.25]} rotation={[0.4, 0, a * 0.5]} castShadow>
                  <coneGeometry args={[0.14, 0.42, 8]} />
                  <Ink w={0.03} />
                </mesh>
              </group>
            ))}
          </group>
        </>
      );
    case 'buzz':
      return <Cap color={c} cover={0.32} tilt={-0.3} />;
    case 'tufts':
      // bald dome, fluffy tufts above the ears
      return (
        <>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.92, 0.25, -0.15]}>
              {[0, 1, 2].map((i) => (
                <mesh key={i} material={m} position={[s * 0.08 * i, 0.16 - i * 0.14, -0.1 * i]} castShadow>
                  <sphereGeometry args={[0.2 - i * 0.02, 14, 10]} />
                  <Ink w={0.03} />
                </mesh>
              ))}
            </group>
          ))}
        </>
      );
    case 'bun':
      return (
        <>
          <Cap color={c} cover={0.4} tilt={-0.35} />
          <mesh material={m} position={[0, 0.95, -0.45]} castShadow>
            <sphereGeometry args={[0.36, 20, 14]} />
            <Ink w={0.035} />
          </mesh>
          {/* two soft side bangs */}
          {[-1, 1].map((s) => (
            <mesh key={s} material={m} position={[s * 0.72, 0.45, 0.55]} rotation={[0.5, 0, s * 0.6]} castShadow>
              <coneGeometry args={[0.16, 0.45, 10]} />
              <Ink w={0.03} />
            </mesh>
          ))}
        </>
      );
    case 'long':
      // cap + a back drape down to the shoulders
      return (
        <>
          <Cap color={c} cover={0.4} tilt={-0.35} />
          <mesh material={m} castShadow>
            <sphereGeometry args={[1.06, 40, 24, Math.PI * 1.08, Math.PI * 0.84, 0.15, Math.PI * 0.72]} />
            <Ink w={0.035} />
          </mesh>
        </>
      );
  }
};

/** Mustache, stubble or beard. Hair color, outlined (except stubble dots). */
export const Facial: React.FC<{look: Look}> = ({look}) => {
  if (!look.facial) return null;
  const m = toonMat(look.hairColor, 'char');
  if (look.facial === 'mustache') {
    return (
      <group position={[0, -0.17, 0.965]} rotation={[0.18, 0, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} material={m} position={[s * 0.12, 0, 0]} rotation={[0, 0, s * 0.3]} scale={[0.15, 0.06, 0.06]} castShadow>
            <sphereGeometry args={[1, 16, 10]} />
            <Ink w={0.02} />
          </mesh>
        ))}
      </group>
    );
  }
  if (look.facial === 'stubble') {
    // a soft stubble shadow on the jaw (dots read as freckles at phone size)
    return (
      <mesh rotation={[0.25, 0, 0]}>
        <sphereGeometry args={[1.004, 32, 16, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.64, Math.PI * 0.3]} />
        <meshToonMaterial color={look.hairColor} transparent opacity={0.22} depthWrite={false} />
      </mesh>
    );
  }
  // beard: a lower-face shell, plus a small mustache
  return (
    <>
      <mesh material={m} rotation={[0.25, 0, 0]} castShadow>
        <sphereGeometry args={[1.05, 32, 16, Math.PI * 0.05, Math.PI * 0.9, Math.PI * 0.62, Math.PI * 0.34]} />
        <Ink w={0.03} />
      </mesh>
      <group position={[0, -0.17, 0.965]} rotation={[0.18, 0, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} material={m} position={[s * 0.11, 0, 0]} rotation={[0, 0, s * 0.3]} scale={[0.13, 0.055, 0.05]}>
            <sphereGeometry args={[1, 14, 8]} />
            <Ink w={0.018} />
          </mesh>
        ))}
      </group>
    </>
  );
};
