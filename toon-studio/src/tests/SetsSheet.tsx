import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Character, headWorld} from '../characters/Character';
import {CAST} from '../characters/cast';
import {POSES} from '../characters/poses';
import {useFormat} from '../engine/format';
import {Fx} from '../engine/fx';
import {Stage} from '../engine/Stage';
import {SETS} from '../sets/library';

loadFont({family: 'Bangers', url: staticFile('fonts/Bangers.woff2'), weight: '400'});

/** One frame per set: the set from its `wide` anchor with ODD for scale. */
export const SetsSheet: React.FC<{anchor?: 'wide' | 'mid' | 'low_fg' | 'high' | 'close'}> = ({anchor = 'wide'}) => {
  const f = useCurrentFrame();
  const fmt = useFormat();
  const set = SETS[f % SETS.length];
  const cam = set.anchors[anchor][fmt];
  const S = set.Component;
  return (
    <AbsoluteFill>
      <Stage cam={cam} light={set.light} background={set.background} fog={set.fog}>
        <S />
        <Character look={CAST.odd.look} joints={POSES.hipsBoth} expression="smile" />
        <Fx focus={headWorld()} bokehScale={2} focusRange={4} bloom={0.6} vignette={0.35} />
      </Stage>
      <div
        style={{
          position: 'absolute',
          top: 36,
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Bangers',
          fontSize: fmt === '9x16' ? 84 : 72,
          color: '#FFC94A',
          WebkitTextStroke: '8px #141414',
          paintOrder: 'stroke fill',
          textTransform: 'uppercase',
          letterSpacing: 2,
        }}
      >
        {set.name}
      </div>
    </AbsoluteFill>
  );
};
