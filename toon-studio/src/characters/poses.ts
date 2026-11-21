import {spring} from 'remotion';
import {mulberry32} from '../engine/rng';

// Pose and motion library (A5). All values are pure functions of frame (A2.1).

/** Arm joint angles in "body terms": out = away from the body, fwd = toward the camera. */
export type ArmJ = {out: number; fwd: number; elbowIn: number; elbowFwd: number};

export type Joints = {
  lArm: ArmJ; // character's left (+x)
  rArm: ArmJ;
  lLeg: number;
  rLeg: number;
  lKnee: number;
  rKnee: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
  bodyYaw: number;
  lean: number;
  sway: number;
  bob: number;
};

const arm = (out: number, fwd = 0, elbowIn = 0, elbowFwd = 0): ArmJ => ({out, fwd, elbowIn, elbowFwd});

const BASE: Joints = {
  lArm: arm(0.12, 0.05, 0.12, 0.05),
  rArm: arm(0.12, 0.05, 0.12, 0.05),
  lLeg: 0,
  rLeg: 0,
  lKnee: 0,
  rKnee: 0,
  headYaw: 0,
  headPitch: 0,
  headRoll: 0,
  bodyYaw: 0,
  lean: 0,
  sway: 0,
  bob: 0,
};

const HIP = arm(0.78, -0.1, 1.5, -0.15); // hand on hip, elbow out (signature pose in the reference)

export const POSES = {
  stand: BASE,
  hipsBoth: {...BASE, lArm: HIP, rArm: HIP},
  hipLeft: {...BASE, lArm: HIP},
  pointR: {...BASE, lArm: HIP, rArm: arm(0.5, 1.25, 0.05, 0.1)},
  shrug: {...BASE, lArm: arm(0.55, 0.3, 1.6, 0.4), rArm: arm(0.55, 0.3, 1.6, 0.4), headRoll: 0.08},
  armsUp: {...BASE, lArm: arm(2.5, 0, -0.2, 0), rArm: arm(2.5, 0, -0.2, 0)},
} satisfies Record<string, Joints>;

export type PoseName = keyof typeof POSES;

const mixArm = (a: ArmJ, b: ArmJ, t: number): ArmJ => ({
  out: a.out + (b.out - a.out) * t,
  fwd: a.fwd + (b.fwd - a.fwd) * t,
  elbowIn: a.elbowIn + (b.elbowIn - a.elbowIn) * t,
  elbowFwd: a.elbowFwd + (b.elbowFwd - a.elbowFwd) * t,
});

export const mix = (a: Joints, b: Joints, t: number): Joints => {
  const out = {...a};
  (Object.keys(a) as (keyof Joints)[]).forEach((k) => {
    if (k === 'lArm' || k === 'rArm') out[k] = mixArm(a[k], b[k], t);
    else (out[k] as number) = (a[k] as number) + ((b[k] as number) - (a[k] as number)) * t;
  });
  return out;
};

/** Spring 0→1 (with overshoot) starting at startSec. Damping 12–14 per A5. */
export const springAt = (frame: number, fps: number, startSec: number, damping = 13, stiffness = 120) =>
  spring({frame: frame - Math.round(startSec * fps), fps, config: {damping, stiffness, mass: 0.9}});

/** Idle: torso bob ±1.5% over 2.4 s, head sway ±2°, seeded phase (A5). */
export const withIdle = (j: Joints, frame: number, fps: number, seed: number, amp = 1): Joints => {
  const r = mulberry32(seed);
  const ph = r() * Math.PI * 2;
  const t = frame / fps;
  const w = (Math.PI * 2) / 2.4;
  return {
    ...j,
    bob: j.bob + Math.sin(t * w + ph) * 0.06 * amp,
    headRoll: j.headRoll + Math.sin(t * w * 0.5 + ph) * 0.035 * amp,
    headPitch: j.headPitch + Math.sin(t * w + ph + 1) * 0.015 * amp,
    sway: j.sway + Math.sin(t * w * 0.5 + ph + 2) * 0.01 * amp,
    lArm: {...j.lArm, out: j.lArm.out + Math.sin(t * w + ph) * 0.02 * amp},
    rArm: {...j.rArm, out: j.rArm.out + Math.sin(t * w + ph + 0.5) * 0.02 * amp},
  };
};
