import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Character, headWorld} from '../../characters/Character';
import {blinkAt, type Expression} from '../../characters/Face';
import {motion, type MotionName} from '../../characters/motions';
import {POSES, type Joints} from '../../characters/poses';
import {cameraAt, type Anchor, type Move, type Vec3} from '../../engine/camera';
import {useFormat, type Format} from '../../engine/format';
import {Fx} from '../../engine/fx';
import {hashSeed} from '../../engine/rng';
import {Stage, type LightPreset} from '../../engine/Stage';
import type {Anchors} from '../../sets/kit';
import {GUESTS} from './guests';
import shotlist from './shotlist.json';

export type Shot = (typeof shotlist.shots)[number] & {
  camera: Record<Format, {anchor: string; move: string; punchAtSec?: number; amount?: number}>;
};
export const SHOTLIST = shotlist as unknown as {slug: string; fps: number; duration: number; shots: Shot[]};
export const shotById = (id: string) => SHOTLIST.shots.find((s) => s.id === id)!;

/** Seconds since the shot started (Sequence-local frame). */
export const useShotTime = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps};
};

export type SceneProps = {
  shot: Shot;
  anchors: Anchors | Record<string, Record<Format, Anchor>>;
  light: LightPreset;
  background: string;
  fog?: {color: string; near: number; far: number};
  focus: Vec3;
  /** Override the camera move strength. */
  moveAmount?: number;
  bokeh?: number;
  bloom?: number;
  vignette?: number;
  /** 2D overlay (tint, heat haze, flash) drawn over the 3D but under captions. */
  overlay?: React.ReactNode;
  children: React.ReactNode;
};

/** One shot = set + light + camera (from shotlist per format) + post FX. */
export const ShotScene: React.FC<SceneProps> = ({shot, anchors, light, background, fog, focus, moveAmount, bokeh = 5, bloom = 0.6, vignette = 0.4, overlay, children}) => {
  const {frame, fps} = useShotTime();
  const fmt = useFormat();
  const cfg = shot.camera[fmt];
  const anchor = (anchors as Record<string, Record<Format, Anchor>>)[cfg.anchor]?.[fmt];
  if (!anchor) throw new Error(`${shot.id}: unknown anchor "${cfg.anchor}"`);
  const dur = shot.end - shot.start;
  const cam = cameraAt(anchor, cfg.move as Move, frame, fps, dur, {amount: moveAmount ?? cfg.amount, punchAtSec: cfg.punchAtSec});
  return (
    <AbsoluteFill>
      <Stage cam={cam} light={light} background={background} fog={fog}>
        {children}
        <Fx focus={focus} bokehScale={bokeh} focusRange={1.8} bloom={bloom} vignette={vignette} />
      </Stage>
      {overlay}
    </AbsoluteFill>
  );
};

export type ActorProps = {
  id: keyof typeof GUESTS | string;
  action?: MotionName;
  actionStart?: number; // seconds into the shot
  pose?: keyof typeof POSES;
  expression?: Expression;
  position?: Vec3;
  facing?: number;
  holding?: React.ReactNode;
  holdingLeft?: React.ReactNode;
  rootY?: number;
  /** Final say over joints (custom poses on top of the motion). */
  tweak?: (j: Joints, t: number) => Joints;
  talk?: number;
};

/** A guest/cast member driven by the A5 motion library. */
export const Actor: React.FC<ActorProps> = ({id, action = 'idle', actionStart = 0, pose = 'stand', expression = 'neutral', position = [0, 0, 0], facing = 0, holding, holdingLeft, rootY = 0, tweak, talk}) => {
  const {frame, fps, t} = useShotTime();
  const g = GUESTS[id];
  if (!g) throw new Error(`Unknown actor ${id}`);
  const seed = hashSeed(id);
  const m = motion(action, frame, fps, actionStart, seed, POSES[pose]);
  const joints = tweak ? tweak(m.joints, t) : m.joints;
  const travel = m.travel;
  const pos: Vec3 = [position[0] + Math.sin(facing) * travel, position[1], position[2] + Math.cos(facing) * travel];
  return (
    <Character
      look={g.look}
      scale={g.scale ?? 1}
      joints={joints}
      expression={m.expression ?? expression}
      blink={blinkAt(frame, fps, seed)}
      talk={talk ?? m.talk}
      squash={m.squash}
      rootY={m.rootY + rootY}
      position={pos}
      facing={facing}
      holding={holding}
      holdingLeft={holdingLeft}
    />
  );
};

/** Head position of an actor for DOF focus. */
export const headOf = (position: Vec3 = [0, 0, 0], id = 'reg', rootY = 0) => headWorld(position, GUESTS[id]?.scale ?? 1, rootY);
