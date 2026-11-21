import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {SHOTLIST, type Shot} from './kit';
import * as B1 from './shots/batch1';
import * as B2 from './shots/batch2';
import * as B3 from './shots/batch3';

loadFont({family: 'Bangers', url: staticFile('fonts/Bangers.woff2'), weight: '400'});

export const SHOT_COMPONENTS: Record<string, React.FC<{shot: Shot}>> = {
  s01: B1.S01,
  s02: B1.S02,
  s03: B1.S03,
  s04: B1.S04,
  s05: B1.S05,
  s06: B1.S06,
  s07: B1.S07,
  s08: B1.S08,
  s09: B2.S09,
  s10: B2.S10,
  s11: B2.S11,
  s12: B2.S12,
  s13: B2.S13,
  s14: B2.S14,
  s15: B2.S15,
  s16: B2.S16,
  s17: B3.S17,
  s18: B3.S18,
  s19: B3.S19,
  s20: B3.S20,
  s21: B3.S21,
  s22: B3.S22,
  s23: B3.S23,
};

/** Placeholder for shots not built yet (STATE 7 in progress). */
const Todo: React.FC<{shot: Shot}> = ({shot}) => (
  <AbsoluteFill style={{background: '#2A2E34', color: '#FFF', fontFamily: 'Bangers', alignItems: 'center', justifyContent: 'center', fontSize: 64, textAlign: 'center', padding: 60}}>
    {shot.id}: {shot.line}
  </AbsoluteFill>
);

export const ShotById: React.FC<{shot: Shot}> = ({shot}) => {
  const C = SHOT_COMPONENTS[shot.id] ?? Todo;
  return <C shot={shot} />;
};

/** Pictures only (audio + captions are added in STATE 8). */
export const Shots: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SHOTLIST.shots.map((s) => {
        const from = Math.round(s.start * fps);
        const dur = Math.round(s.end * fps) - from;
        return (
          <Sequence key={s.id} from={from} durationInFrames={dur} premountFor={fps}>
            <ShotById shot={s} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/** Contact sheet: frame i = shot ids[i] frozen at its middle (or at `at` × length). */
export const ContactSheet: React.FC<{ids: string[]; at?: number}> = ({ids, at = 0.5}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shot = SHOTLIST.shots.find((s) => s.id === ids[f % ids.length])!;
  const local = Math.round((shot.end - shot.start) * fps * at);
  return (
    <AbsoluteFill>
      {/* A shifted Sequence (not <Freeze>): Freeze's frame does not reach inside ThreeCanvas. */}
      <Sequence from={f - local} layout="absolute-fill">
        <ShotById shot={shot} />
      </Sequence>
      <div style={{position: 'absolute', top: 18, left: 22, fontFamily: 'Bangers', fontSize: 54, color: '#FFC94A', WebkitTextStroke: '6px #141414', paintOrder: 'stroke fill'}}>
        {shot.id}
      </div>
    </AbsoluteFill>
  );
};
