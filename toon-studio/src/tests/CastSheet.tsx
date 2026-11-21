import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Character, headWorld} from '../characters/Character';
import {CAST, CAST_IDS} from '../characters/cast';
import type {Expression} from '../characters/Face';
import {POSES} from '../characters/poses';
import {Fx} from '../engine/fx';
import {C} from '../engine/palette';
import {Stage} from '../engine/Stage';
import {Studio} from './Studio';

loadFont({family: 'Bangers', url: staticFile('fonts/Bangers.woff2'), weight: '400'});

// One frame = one panel. frame = castIndex * 6 + panel.
// Panels: 0 front, 1 three-quarter, 2–5 expression close-ups.
export const PANELS = 6;
const EXPR: Expression[] = ['happy', 'shocked', 'angry', 'worried'];

export const CastSheet: React.FC = () => {
  const f = useCurrentFrame();
  const id = CAST_IDS[Math.floor(f / PANELS) % CAST_IDS.length];
  const p = f % PANELS;
  const m = CAST[id];
  const full = p < 2;
  const cam = full
    ? {pos: [0, 3.5, 18] as [number, number, number], target: [0, 3.35, 0] as [number, number, number], fov: 26}
    : {pos: [0, 5.45, 7.2] as [number, number, number], target: [0, 5.35, 0] as [number, number, number], fov: 26};
  const expression: Expression = full ? (p === 0 ? 'smile' : 'neutral') : EXPR[p - 2];
  const label = p === 0 ? m.name : p === 1 ? '3/4 view' : EXPR[p - 2];
  return (
    <AbsoluteFill style={{backgroundColor: C.wallCream}}>
      <Stage cam={cam} light="interior" background={C.wallCream}>
        <Studio />
        <Character
          look={m.look}
          joints={p === 0 ? POSES.hipsBoth : POSES.stand}
          expression={expression}
          facing={p === 1 ? 0.65 : 0}
        />
        <Fx focus={headWorld()} bokehScale={0.01} bloom={0.3} vignette={0.15} msaa={4} />
      </Stage>
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Bangers',
          fontSize: p === 0 ? 64 : 46,
          color: p === 0 ? '#FFC94A' : '#FFFFFF',
          WebkitTextStroke: '6px #141414',
          paintOrder: 'stroke fill',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};
