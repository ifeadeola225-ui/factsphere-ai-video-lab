import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useFormat} from '../engine/format';

// Brief section 0.5: ALL CAPS Bangers, white, ~6 px black stroke, soft shadow, small, y ≈ 64% (9:16).
// Bundled locally (public/fonts) so renders never depend on network font loading. OFL license.
const fontFamily = 'Bangers';
loadFont({family: fontFamily, url: staticFile('fonts/Bangers.woff2'), weight: '400'});

export type Word = {text: string; start: number; end: number; emphasis?: boolean};

const STYLE = {
  '9x16': {size: 70, top: 0.64, stroke: 7},
  '16x9': {size: 58, top: 0.84, stroke: 6},
} as const;

export const WordCaptions: React.FC<{words: Word[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = STYLE[useFormat()];
  const t = frame / fps;
  const w = words.find((x) => t >= x.start && t < x.end);
  if (!w) return null;
  const pop = spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 14, stiffness: 260}, durationInFrames: 5});
  const scale = (0.82 + 0.18 * pop) * (w.emphasis ? 1.12 : 1);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: `${f.top * 100}%`,
          left: 0,
          right: 0,
          textAlign: 'center',
          transform: `translateY(-50%) scale(${scale})`,
          fontFamily,
          fontSize: f.size,
          letterSpacing: 1.5,
          color: w.emphasis ? '#FFC94A' : '#FFFFFF',
          WebkitTextStroke: `${f.stroke}px #141414`,
          paintOrder: 'stroke fill',
          textShadow: '0 4px 0 rgba(0,0,0,.35)',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        {w.text}
      </div>
    </AbsoluteFill>
  );
};
