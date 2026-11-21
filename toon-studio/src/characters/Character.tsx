import React from 'react';
import * as THREE from 'three';
import {Ink} from '../engine/Ink';
import {toonMat} from '../engine/toon';
import {Glasses, HatMesh} from './accessories';
import {BODY} from './body';
import type {Look} from './cast';
import {Face, type Expression} from './Face';
import {Facial, Hair} from './hair';
import {OutfitDetails, torsoGeometry} from './outfits';
import type {ArmJ, Joints} from './poses';

export {BODY};

const limbMat = new THREE.MeshToonMaterial({color: '#160502'});
const limbGeo = (len: number) => new THREE.CapsuleGeometry(BODY.limbR, len, 4, 8);
const GEO = {
  upper: limbGeo(BODY.upperArm),
  fore: limbGeo(BODY.foreArm),
  thigh: limbGeo(BODY.thigh),
  shin: limbGeo(BODY.shin),
  hand: new THREE.SphereGeometry(BODY.handR, 16, 12),
  foot: new THREE.SphereGeometry(1, 16, 12),
  head: new THREE.SphereGeometry(1, 64, 48),
};

const Limb: React.FC<{len: number; geo: THREE.BufferGeometry}> = ({len, geo}) => (
  <mesh position={[0, -len / 2, 0]} material={limbMat} geometry={geo} castShadow />
);

const Arm: React.FC<{side: 1 | -1; j: ArmJ; children?: React.ReactNode}> = ({side, j, children}) => (
  <group position={[side * BODY.shoulderX, BODY.shoulderY, 0]} rotation={[-j.fwd, 0, side * j.out, 'XZY']}>
    <Limb len={BODY.upperArm} geo={GEO.upper} />
    <group position={[0, -BODY.upperArm, 0]} rotation={[-j.elbowFwd, 0, -side * j.elbowIn, 'XZY']}>
      <Limb len={BODY.foreArm} geo={GEO.fore} />
      <group position={[0, -BODY.foreArm, 0]}>
        <mesh material={limbMat} geometry={GEO.hand} castShadow />
        {children}
      </group>
    </group>
  </group>
);

const Leg: React.FC<{side: 1 | -1; swing: number; knee: number; hidden?: boolean}> = ({side, swing, knee}) => (
  <group position={[side * BODY.hipX, BODY.hipY, 0]} rotation={[swing, 0, side * 0.03]}>
    <Limb len={BODY.thigh} geo={GEO.thigh} />
    <group position={[0, -BODY.thigh, 0]} rotation={[knee, 0, 0]}>
      <Limb len={BODY.shin} geo={GEO.shin} />
      {/* foot: small dark oval, toes out; counter-rotated so it stays flat-ish */}
      <group position={[0, -BODY.shin - 0.02, 0]} rotation={[-(swing + knee) * 0.7, 0, 0]}>
        <mesh position={[side * 0.03, 0, 0.08]} rotation={[0, side * 0.25, 0]} scale={[0.15, 0.085, 0.25]} material={limbMat} geometry={GEO.foot} castShadow />
      </group>
    </group>
  </group>
);

export type CharacterProps = {
  look: Look;
  joints: Joints;
  expression: Expression;
  blink?: number;
  talk?: number;
  position?: [number, number, number];
  facing?: number; // radians, 0 = toward camera (+z)
  scale?: number;
  /** Vertical squash/stretch around the feet (gasp, jump). 1 = none. */
  squash?: number;
  /** Extra height off the ground (jump). */
  rootY?: number;
  /** Anything held in the right hand (a prop component). */
  holding?: React.ReactNode;
  /** Anything held in the left hand. */
  holdingLeft?: React.ReactNode;
};

/** Head world position for a character (for DOF focus). */
export const headWorld = (position: [number, number, number] = [0, 0, 0], scale = 1, rootY = 0): [number, number, number] => [
  position[0],
  position[1] + (BODY.headY + rootY) * scale,
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
  squash = 1,
  rootY = 0,
  holding,
  holdingLeft,
}) => {
  const top = toonMat(look.top, 'char');
  const skin = toonMat(look.skin, 'char');
  // keep volume roughly: stretch up = thinner
  const sx = 1 / Math.sqrt(squash);
  return (
    <group position={position} rotation={[0, facing + j.bodyYaw, 0]} scale={scale}>
      <group position={[0, rootY, 0]} scale={[sx, squash, sx]}>
        <Leg side={1} swing={j.lLeg} knee={j.lKnee} />
        <Leg side={-1} swing={j.rLeg} knee={j.rKnee} />
        {/* upper body bobs and leans as one, pivoting at the hips */}
        <group position={[0, BODY.hipY + j.bob, 0]} rotation={[j.lean, 0, j.sway]}>
          <group position={[0, -BODY.hipY, 0]}>
            <mesh position={[0, BODY.torsoY, 0]} scale={[1, 1, 0.85]} material={top} geometry={torsoGeometry} castShadow>
              <Ink w={0.035} />
            </mesh>
            <group scale={[1, 1, 0.85]}>
              <OutfitDetails look={look} />
            </group>
            <Arm side={1} j={j.lArm}>
              {holdingLeft}
            </Arm>
            <Arm side={-1} j={j.rArm}>
              {holding}
            </Arm>
            <group position={[0, BODY.headY, 0]} rotation={[j.headPitch, j.headYaw, j.headRoll, 'YXZ']}>
              <mesh material={skin} geometry={GEO.head} castShadow>
                <Ink w={0.042} />
              </mesh>
              <Face expression={expression} blink={blink} talk={talk} />
              <Facial look={look} />
              <Glasses look={look} />
              <Hair look={look} />
              <HatMesh look={look} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
