import {Easing, interpolate} from 'remotion';
import * as THREE from 'three';

export type Vec3 = [number, number, number];
export type Anchor = {pos: Vec3; target: Vec3; fov: number};
export type Move =
  | 'hold' // still subtle: A3.6 says never fully static
  | 'push-in'
  | 'pull-out'
  | 'drift-left'
  | 'drift-right'
  | 'punch-in'
  | 'whip'
  | 'orbit'
  | 'crane-up';

export type MoveOpts = {
  amount?: number; // strength of the move (meaning depends on move)
  punchAtSec?: number; // for punch-in: when the punch starts (seconds into the shot)
};

export type CameraState = {pos: Vec3; target: Vec3; fov: number; roll?: number};

const v = (a: Vec3) => new THREE.Vector3(...a);
const arr = (x: THREE.Vector3): Vec3 => [x.x, x.y, x.z];
const ease = Easing.inOut(Easing.sin);

/**
 * Camera for a given frame of a shot. Pure function of frame (A2.1).
 * durSec: shot length in seconds.
 */
export const cameraAt = (
  anchor: Anchor,
  move: Move,
  frame: number,
  fps: number,
  durSec: number,
  opts: MoveOpts = {},
): CameraState => {
  const t = Math.min(1, Math.max(0, frame / (durSec * fps)));
  const pos = v(anchor.pos);
  const target = v(anchor.target);
  const toTarget = target.clone().sub(pos);
  const dist = toTarget.length();
  const dir = toTarget.clone().normalize();
  const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  let fov = anchor.fov;
  let roll = 0;

  switch (move) {
    case 'hold': {
      // tiny breathing drift so the frame is never dead still
      pos.addScaledVector(side, (ease(t) - 0.5) * dist * 0.012);
      break;
    }
    case 'push-in': {
      pos.addScaledVector(dir, ease(t) * dist * (opts.amount ?? 0.08));
      break;
    }
    case 'pull-out': {
      pos.addScaledVector(dir, -ease(t) * dist * (opts.amount ?? 0.08));
      break;
    }
    case 'drift-left':
    case 'drift-right': {
      const s = move === 'drift-left' ? -1 : 1;
      const d = (t - 0.5) * dist * (opts.amount ?? 0.07) * s;
      pos.addScaledVector(side, d);
      target.addScaledVector(side, d * 0.4); // parallax: target moves less than camera
      break;
    }
    case 'punch-in': {
      // slow push, then a fast 12-frame ease to a close-up (A3.6)
      const at = (opts.punchAtSec ?? durSec * 0.5) * fps;
      const slow = ease(t) * 0.05;
      const punch = interpolate(frame, [at, at + 12], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      });
      pos.addScaledVector(dir, dist * (slow + punch * (opts.amount ?? 0.45)));
      break;
    }
    case 'whip': {
      // gentle drift, then a fast sideways yaw in the last 8 frames
      pos.addScaledVector(side, (t - 0.5) * dist * 0.04);
      const endF = durSec * fps;
      const w = interpolate(frame, [endF - 8, endF], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.in(Easing.cubic),
      });
      target.addScaledVector(side, w * dist * (opts.amount ?? 1.2));
      roll = w * 0.08;
      break;
    }
    case 'orbit': {
      const ang = (ease(t) - 0.5) * (opts.amount ?? 0.35);
      const off = pos.clone().sub(target).applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
      pos.copy(target).add(off);
      break;
    }
    case 'crane-up': {
      pos.y += ease(t) * dist * (opts.amount ?? 0.1);
      break;
    }
  }
  return {pos: arr(pos), target: arr(target), fov, roll};
};
