import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {WordCaptions, type Word} from '../captions/WordCaptions';
import {Character, headWorld} from '../characters/Character';
import {CAST} from '../characters/cast';
import {blinkAt, type Expression} from '../characters/Face';
import {POSES, mix, springAt, withIdle} from '../characters/poses';
import {cameraAt} from '../engine/camera';
import {useFormat} from '../engine/format';
import {Fx} from '../engine/fx';
import {C} from '../engine/palette';
import {Stage} from '../engine/Stage';
import {SMALL_ROOM_ANCHORS, SmallRoom} from '../sets/SmallRoom';

// STATE 2 style test (4 s): idle + blink; at 1.5 s turns to camera with a smile; then points.
// Camera pushes in slowly with depth of field. Placeholder captions.
const WORDS: Word[] = [
  {text: 'This', start: 0.25, end: 1.0},
  {text: 'is', start: 1.0, end: 1.6},
  {text: 'the', start: 1.6, end: 2.2},
  {text: 'look.', start: 2.2, end: 4.0, emphasis: true},
];

export const StyleTest: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const fmt = useFormat();
  const seed = 7;

  // turn: head leads by 3 frames, body follows
  const turnHead = springAt(frame, fps, 1.4, 12);
  const turnBody = springAt(frame, fps, 1.5, 14);
  const facing = -0.75 * (1 - turnBody);
  const pointT = springAt(frame, fps, 2.35, 12, 140);

  let j = mix(POSES.hipLeft, POSES.pointR, pointT);
  j = {...j, headYaw: -0.25 * (1 - turnHead)};
  j = withIdle(j, frame, fps, seed);
  const expression: Expression = frame < 1.6 * fps ? 'neutral' : 'smile';

  const cam = cameraAt(SMALL_ROOM_ANCHORS.mid[fmt], 'push-in', frame, fps, durationInFrames / fps, {amount: 0.14});
  const focus = headWorld();

  return (
    <AbsoluteFill>
      <Stage cam={cam} light="interior" background={C.wallButter} fog={{color: '#F3E2C0', near: 22, far: 60}}>
        <SmallRoom />
        <Character look={CAST.everyman} joints={j} expression={expression} blink={blinkAt(frame, fps, seed)} facing={facing} />
        <Fx focus={focus} bokehScale={5} focusRange={1.6} bloom={0.6} vignette={0.4} />
      </Stage>
      <WordCaptions words={WORDS} />
    </AbsoluteFill>
  );
};
