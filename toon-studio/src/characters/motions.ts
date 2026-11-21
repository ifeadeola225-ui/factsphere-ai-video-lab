import {Easing, interpolate} from 'remotion';
import {mulberry32} from '../engine/rng';
import {BODY} from './body';
import type {Expression} from './Face';
import {POSES, mix, springAt, withIdle, type ArmJ, type Joints} from './poses';

// A5 animation library. Every motion is a pure function of (frame, fps, startSec, seed).

export type MotionName =
  | 'idle'
  | 'walk'
  | 'nod'
  | 'shake'
  | 'talk'
  | 'gasp'
  | 'jump'
  | 'point'
  | 'tap'
  | 'type'
  | 'carry'
  | 'sit'
  | 'wave';

export type MotionOut = {
  joints: Joints;
  rootY: number;
  squash: number;
  talk: number;
  /** distance travelled forward (walk / carry), in body units; the shot moves the character */
  travel: number;
  expression?: Expression;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const arm = (out: number, fwd = 0, elbowIn = 0, elbowFwd = 0): ArmJ => ({out, fwd, elbowIn, elbowFwd});

/** Walk cycle values at time t (s). cycle 0.8 s, leg ±28°, opposite arm ±22°, bob 2×/cycle (A5). */
const walkPose = (j: Joints, t: number, speed = 1): {j: Joints; bobY: number} => {
  const ph = (t / (0.8 / speed)) * Math.PI * 2;
  const leg = 0.49; // 28°
  const armS = 0.38; // 22°
  const l = Math.sin(ph);
  return {
    j: {
      ...j,
      lLeg: -l * leg,
      rLeg: l * leg,
      // knee bends on the back-swinging leg
      lKnee: Math.max(0, l) * 0.55,
      rKnee: Math.max(0, -l) * 0.55,
      lArm: {...j.lArm, out: 0.1, fwd: l * armS, elbowIn: 0.15, elbowFwd: 0.15},
      rArm: {...j.rArm, out: 0.1, fwd: -l * armS, elbowIn: 0.15, elbowFwd: 0.15},
      headRoll: j.headRoll + Math.sin(ph) * 0.025,
    },
    bobY: Math.abs(Math.cos(ph)) * 0.12 - 0.06,
  };
};

export const motion = (
  name: MotionName,
  frame: number,
  fps: number,
  startSec: number,
  seed: number,
  base: Joints = POSES.stand,
): MotionOut => {
  const t = Math.max(0, frame / fps - startSec);
  const tf = frame - startSec * fps; // frames since start
  const out: MotionOut = {joints: withIdle(base, frame, fps, seed), rootY: 0, squash: 1, talk: 0, travel: 0};

  switch (name) {
    case 'idle':
      return out;

    case 'walk':
    case 'carry': {
      const speed = name === 'carry' ? 0.7 : 1; // carry slowed 30%
      const w = walkPose(base, t, speed);
      let j = w.j;
      if (name === 'carry') {
        j = {...j, lean: 0.14, lArm: arm(0.15, 1.2, 0.5, 0.2), rArm: arm(0.15, 1.2, 0.5, 0.2)};
      }
      out.joints = {...j, bob: w.bobY};
      out.travel = t * 2.6 * speed; // ~2.6 units/s matches the stride
      return out;
    }

    case 'nod':
    case 'shake': {
      // ±10° pitch ×2 or ±14° yaw ×2 over 0.6 s
      const k = interpolate(t, [0, 0.6], [0, 1], clamp);
      const v = Math.sin(k * Math.PI * 4) * (1 - k * 0.3) * (k < 1 ? 1 : 0);
      out.joints = name === 'nod' ? {...out.joints, headPitch: out.joints.headPitch + v * 0.17} : {...out.joints, headYaw: out.joints.headYaw + v * 0.24};
      return out;
    }

    case 'talk': {
      // hand-gesture loop + mouth flap ≈ 6 Hz with seeded variation
      const r = mulberry32(seed);
      const ph = r() * 10;
      const g = (Math.sin(t * 2.2 + ph) + 1) / 2; // gesture 0..1
      const gestureArm = arm(0.35 + 0.25 * g, 0.55 + 0.35 * g, 1.3 - 0.5 * g, 0.4);
      out.joints = {...out.joints, rArm: gestureArm, headPitch: out.joints.headPitch + Math.sin(t * 3.1 + ph) * 0.04};
      const flap = Math.sin(t * Math.PI * 2 * (5.5 + r())) * 0.5 + 0.5;
      const word = Math.sin(t * 9.7 + ph) > -0.6 ? 1 : 0.2; // little pauses
      out.talk = 0.2 + 0.8 * flap * word;
      return out;
    }

    case 'gasp': {
      // anticipation squash 0.92 (3 frames) → stretch 1.08, arms up, shocked, hold
      out.squash = interpolate(tf, [0, 3, 7, 14], [1, 0.92, 1.08, 1.02], {...clamp, easing: Easing.out(Easing.quad)});
      const up = springAt(frame, fps, startSec + 0.1, 11);
      out.joints = mix(out.joints, {...out.joints, lArm: arm(1.95, 0.35, 0.75, 0), rArm: arm(1.95, 0.35, 0.75, 0), lean: -0.06, headPitch: -0.08}, up);
      if (tf >= 2) out.expression = 'shocked';
      return out;
    }

    case 'jump': {
      // squash, launch, overshoot, land with a squash
      const crouch = 0.25, air = 0.55;
      out.squash =
        t < crouch
          ? interpolate(t, [0, crouch], [1, 0.84], clamp)
          : t < crouch + air
            ? interpolate(t, [crouch, crouch + 0.1, crouch + air], [1.12, 1.03, 1.0], clamp)
            : interpolate(t, [crouch + air, crouch + air + 0.08, crouch + air + 0.3], [0.86, 1.04, 1], clamp);
      if (t >= crouch && t < crouch + air) {
        const k = (t - crouch) / air;
        out.rootY = Math.sin(k * Math.PI) * 1.8;
        out.joints = {...out.joints, lArm: arm(2.4, 0.2, -0.2), rArm: arm(2.4, 0.2, -0.2), lKnee: 0.5, rKnee: 0.5, lLeg: -0.3, rLeg: -0.3};
        out.expression = 'happy';
      }
      return out;
    }

    case 'point': {
      const s = springAt(frame, fps, startSec, 12, 140);
      out.joints = withIdle(mix(base, {...base, rArm: POSES.pointR.rArm}, s), frame, fps, seed);
      return out;
    }

    case 'wave': {
      const s = springAt(frame, fps, startSec, 12);
      const wv = Math.sin(t * Math.PI * 2 * 1.6) * 0.35;
      out.joints = withIdle(mix(base, {...base, rArm: arm(2.2, 0.2, 0.6 + wv, 0)}, s), frame, fps, seed);
      return out;
    }

    case 'tap': {
      // wrist (forearm) swings ×3 with a small impact pause
      const cyc = 0.4;
      const k = (t % cyc) / cyc;
      const n = Math.floor(t / cyc);
      const hit = n < 3 ? interpolate(k, [0, 0.55, 0.65, 1], [0, 1, 1, 0], clamp) : 0;
      out.joints = {...out.joints, rArm: arm(0.3, 0.9, 0.4 + hit * 0.9, 0.2)};
      return out;
    }

    case 'type': {
      const l = Math.max(0, Math.sin(t * Math.PI * 2 * 4));
      const r2 = Math.max(0, Math.sin(t * Math.PI * 2 * 4 + Math.PI));
      out.joints = {
        ...out.joints,
        lArm: arm(0.2, 0.75 + l * 0.12, 1.3, 0.25),
        rArm: arm(0.2, 0.75 + r2 * 0.12, 1.3, 0.25),
        headPitch: out.joints.headPitch + 0.12,
      };
      return out;
    }

    case 'sit': {
      // knees at 90°, hands on thighs, bob reduced. Seat height 1.1: root drops by thigh-ish.
      out.joints = withIdle(
        {
          ...base,
          lLeg: -Math.PI / 2,
          rLeg: -Math.PI / 2,
          lKnee: Math.PI / 2,
          rKnee: Math.PI / 2,
          lArm: arm(0.12, 0.7, 0.2, 0.5),
          rArm: arm(0.12, 0.7, 0.2, 0.5),
        },
        frame,
        fps,
        seed,
        0.4,
      );
      out.rootY = -(BODY.hipY - 1.15);
      return out;
    }
  }
};
