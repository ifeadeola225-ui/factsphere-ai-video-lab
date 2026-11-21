import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {WordCaptions, type Word} from '../captions/WordCaptions';
import {Character, headWorld} from '../characters/Character';
import {CAST} from '../characters/cast';
import {blinkAt, type Expression} from '../characters/Face';
import {motion, type MotionName} from '../characters/motions';
import {POSES} from '../characters/poses';
import {cameraAt} from '../engine/camera';
import {useFormat} from '../engine/format';
import {Fx} from '../engine/fx';
import {C} from '../engine/palette';
import {Stage} from '../engine/Stage';
import {SMALL_ROOM_ANCHORS, SmallRoom} from '../sets/SmallRoom';

// STATE 3 motion reel (12 s): walk, nod, gasp, point, jump, talk — 2 s each.
const SEGS: {m: MotionName; label: string; expr: Expression}[] = [
  {m: 'walk', label: 'walk', expr: 'neutral'},
  {m: 'nod', label: 'nod', expr: 'smile'},
  {m: 'gasp', label: 'gasp', expr: 'neutral'},
  {m: 'point', label: 'point', expr: 'smug'},
  {m: 'jump', label: 'jump', expr: 'smile'},
  {m: 'talk', label: 'talk', expr: 'smile'},
];
const SEG = 2;
const WORDS: Word[] = SEGS.map((s, i) => ({text: s.label, start: i * SEG + 0.15, end: (i + 1) * SEG}));

export const MotionReel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fmt = useFormat();
  const seg = Math.min(SEGS.length - 1, Math.floor(frame / (SEG * fps)));
  const s = SEGS[seg];
  const local = frame - seg * SEG * fps;
  const seed = 11;
  const start = s.m === 'nod' || s.m === 'gasp' || s.m === 'point' || s.m === 'jump' ? 0.4 : 0;
  const base = s.m === 'point' ? POSES.hipLeft : POSES.stand;
  const mo = motion(s.m, local, fps, start, seed, base);

  // walk crosses the room sideways; everything else faces camera
  const walking = s.m === 'walk';
  const pos: [number, number, number] = walking ? [-2.6 + mo.travel, 0, 0.5] : [0, 0, 0];
  const facing = walking ? Math.PI / 2 : 0;
  const anchor = walking ? SMALL_ROOM_ANCHORS.wide[fmt] : SMALL_ROOM_ANCHORS.mid[fmt];
  const cam = cameraAt(anchor, walking ? 'drift-right' : 'push-in', local, fps, SEG, {amount: 0.08});
  return (
    <AbsoluteFill>
      <Stage cam={cam} light="interior" background={C.wallButter} fog={{color: '#F3E2C0', near: 22, far: 60}}>
        <SmallRoom />
        <Character
          look={CAST.odd.look}
          joints={mo.joints}
          expression={mo.expression ?? s.expr}
          blink={blinkAt(frame, fps, seed)}
          talk={mo.talk}
          squash={mo.squash}
          rootY={mo.rootY}
          position={pos}
          facing={facing}
        />
        <Fx focus={headWorld(pos, 1, mo.rootY)} bokehScale={5} focusRange={1.6} bloom={0.6} vignette={0.4} />
      </Stage>
      <WordCaptions words={WORDS} />
    </AbsoluteFill>
  );
};
