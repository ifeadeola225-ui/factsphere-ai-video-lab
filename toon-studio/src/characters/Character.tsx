import React from 'react';
import * as THREE from 'three';
import {Ink} from '../engine/Ink';
import {toonMat} from '../engine/toon';
import {Face, type Expression} from './Face';
import type {Look} from './cast';
import type {Joints, ArmJ} from './poses';

// Proportions: brief section 0.1 (R = head radius = 1). Lanky: head ≈ 31% of height.
export const BODY = {
  headY: 5.2,
  torsoR: 0.72,
  torsoLen: 1.0,
  torsoY: 3.2, // capsule center
  shoulderY: 3.95,
  shoulderX: 0.62,
  hipY: 2.15,
  hipX: 0.3,
  upperArm: 0.95,
  foreArm: 0.9,
  limbR: 0.045,
  thigh: 1.05,
  shin: 1.05,
  handR: 0.11,
  height: 6.3,
} as const;

const limbMat = new THREE.MeshToonMaterial({color: '#160502'});

const Limb: React.FC<{len: number}> = ({len}) => (
  <mesh position={[0, -len / 2, 0]} material={limbMat} castShadow>
    <capsuleGeometry args={[BODY.limbR, len, 4, 8]} />
  </mesh>
);

const Arm: React.FC<{side: 1 | -1; j: ArmJ}> = ({side, j}) => (
  <group position={[side * BODY.shoulderX, BODY.shoulderY, 0]} rotation={[-j.fwd, 0, side * j.out, 'XZY']}>
    <Limb len={BODY.upperArm} />
    <group position={[0, -BODY.upperArm, 0]} rotation={[-j.elbowFwd, 0, -side * j.elbowIn, 'XZY']}>
      <Limb len={BODY.foreArm} />
      <mesh position={[0, -BODY.foreArm, 0]} material={limbMat} castShadow>
        <sphereGeometry args={[BODY.handR, 16, 12]} />
      </mesh>
    </group>
  </group>
);

const Leg: React.FC<{side: 1 | -1; swing: number; knee: number}> = ({side, swing, knee}) => (
  <group position={[side * BODY.hipX, BODY.hipY, 0]} rotation={[swing, 0, side * 0.03]}>
    <Limb len={BODY.thigh} />
    <group position={[0, -BODY.thigh, 0]} rotation={[knee, 0, 0]}>
      <Limb len={BODY.shin} />
      {/* foot: small dark oval, toes out */}
      <mesh position={[side * 0.03, -BODY.shin - 0.02, 0.08]} rotation={[0, side * 0.25, 0]} scale={[0.15, 0.085, 0.25]} material={limbMat} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
    </group>
  </group>
);

/** Hair: a cap shell tilted back, a spiky fringe that breaks the outline, and (ODD) one big forward swoop. */
const FRINGE: [number, number, number][] = [
  // [yaw around head, tilt down, size]
  [-1.25, 0.9, 0.85], [-0.85, 0.8, 1.0], [-0.42, 0.7, 1.05], [0.0, 0.66, 1.1], [0.42, 0.7, 1.0], [0.85, 0.8, 0.95], [1.25, 0.9, 0.8],
  [2.2, 1.1, 0.9], [-2.2, 1.1, 0.9], [3.14, 1.15, 0.9],
];
const Hair: React.FC<{look: Look}> = ({look}) => {
  if (look.hair === 'none') return null;
  const m = toonMat(look.hairColor, 'char');
  return (
    <group rotation={[-0.42, 0, 0]}>
      <mesh material={m} castShadow>
        <sphereGeometry args={[1.035, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.36]} />
        <Ink w={0.035} />
      </mesh>
      {/* fringe spikes around the cap edge, pointing out and down */}
      {FRINGE.map(([yaw, tilt, s], i) => (
        <group key={i} rotation={[0, yaw, 0]}>
          <group position={[0, 0.44, 0.93]} rotation={[tilt + 0.9, 0, (i % 2 ? 0.25 : -0.25)]}>
            <mesh material={m} position={[0, 0.12 * s, 0]} castShadow>
              <coneGeometry args={[0.15 * s, 0.34 * s, 8]} />
              <Ink w={0.03} />
            </mesh>
          </group>
        </group>
      ))}
      {look.hair === 'swoop' ? (
        // ODD's signature: one tall tuft sweeping forward over the brow
        <group position={[0.15, 0.98, 0.1]} rotation={[0.85, 0.1, -0.2]}>
          <mesh material={m} position={[0, 0.3, 0]} castShadow>
            <coneGeometry args={[0.2, 0.75, 10]} />
            <Ink w={0.032} />
          </mesh>
        </group>
      ) : null}
      {look.hair === 'spiky'
        ? [-0.5, -0.2, 0.15, 0.45].map((a, i) => (
            <mesh key={i} material={m} position={[Math.sin(a) * 0.85, 0.62, Math.cos(a) * 0.55]} rotation={[0.5, a, a * 0.8]} castShadow>
              <coneGeometry args={[0.13, 0.4, 10]} />
              <Ink w={0.03} />
            </mesh>
          ))
        : null}
    </group>
  );
};

/** Clothing details on the torso. Rendered inside the torso's z-scale so curved patches hug it. */
const Outfit: React.FC<{look: Look}> = ({look}) => {
  const r = BODY.torsoR;
  if (look.outfit === 'hoodie') {
    const dark = toonMat(look.topShade ?? look.top, 'char');
    const cord = toonMat(look.accent ?? '#F5C242', 'char');
    return (
      <>
        {/* hood rim around the neck */}
        <mesh position={[0, BODY.torsoY + 1.02, -0.1]} rotation={[Math.PI / 2 + 0.25, 0, 0]} material={dark} castShadow>
          <torusGeometry args={[0.5, 0.15, 12, 32]} />
          <Ink w={0.03} />
        </mesh>
        {/* drawstrings: hang straight down the front of the cylinder part */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.17, BODY.torsoY + 0.62, Math.sqrt(r * r - 0.17 * 0.17) + 0.035]}>
            <mesh position={[0, -0.25, 0]} material={cord}>
              <capsuleGeometry args={[0.032, 0.5, 4, 8]} />
            </mesh>
            <mesh position={[0, -0.55, 0.01]} material={cord}>
              <sphereGeometry args={[0.06, 10, 8]} />
              <Ink w={0.015} />
            </mesh>
          </group>
        ))}
        {/* kangaroo pocket: a curved patch on the front */}
        <mesh position={[0, BODY.torsoY - 0.45, 0]} material={dark}>
          <cylinderGeometry args={[r + 0.025, r + 0.03, 0.5, 32, 1, true, -0.62, 1.24]} />
          <Ink w={0.022} />
        </mesh>
      </>
    );
  }
  return null;
};

export type CharacterProps = {
  look: Look;
  joints: Joints;
  expression: Expression;
  blink?: number;
  talk?: number;
  position?: [number, number, number];
  facing?: number; // radians, 0 = toward camera (+z)
  scale?: number;
};

/** Head world position for a character (for DOF focus). */
export const headWorld = (position: [number, number, number] = [0, 0, 0], scale = 1): [number, number, number] => [
  position[0],
  position[1] + BODY.headY * scale,
  position[2],
];

export const Character: React.FC<CharacterProps> = ({
  look,
  joints: j,
  expression,
  blink = 0,
  talk = 0,
  position = [0, 0, 0],
  facing = 0,
  scale = 1,
}) => {
  const top = toonMat(look.top, 'char');
  const skin = toonMat(look.skin, 'char');
  return (
    <group position={position} rotation={[0, facing + j.bodyYaw, 0]} scale={scale}>
      <Leg side={1} swing={j.lLeg} knee={j.lKnee} />
      <Leg side={-1} swing={j.rLeg} knee={j.rKnee} />
      {/* upper body bobs and leans as one */}
      <group position={[0, j.bob, 0]} rotation={[j.lean, 0, j.sway]}>
        <mesh position={[0, BODY.torsoY, 0]} scale={[1, 1, 0.85]} material={top} castShadow>
          <capsuleGeometry args={[BODY.torsoR, BODY.torsoLen, 10, 32]} />
          <Ink w={0.035} />
        </mesh>
        <group scale={[1, 1, 0.85]}>
          <Outfit look={look} />
        </group>
        <Arm side={1} j={j.lArm} />
        <Arm side={-1} j={j.rArm} />
        <group position={[0, BODY.headY, 0]} rotation={[j.headPitch, j.headYaw, j.headRoll, 'YXZ']}>
          <mesh material={skin} castShadow>
            <sphereGeometry args={[1, 64, 48]} />
            <Ink w={0.042} />
          </mesh>
          <Face expression={expression} blink={blink} talk={talk} />
          <Hair look={look} />
        </group>
      </group>
    </group>
  );
};
