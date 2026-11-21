import {interpolate, Easing} from 'remotion';

// A2.6: write time in seconds, convert with fps.
export const sec = (s: number, fps: number) => Math.round(s * fps);

export type ShotTiming = {start: number; end: number};

/** Frames for a shot from its start/end seconds in shotlist.json. */
export const shotFrames = (shot: ShotTiming, fps: number) => ({
  from: sec(shot.start, fps),
  durationInFrames: Math.max(1, sec(shot.end, fps) - sec(shot.start, fps)),
});

/** Progress 0..1 between two times in seconds, eased. */
export const progress = (
  frame: number,
  fps: number,
  fromSec: number,
  toSec: number,
  easing: (t: number) => number = Easing.inOut(Easing.cubic),
) =>
  interpolate(frame, [fromSec * fps, toSec * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
