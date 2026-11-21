import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {WordCaptions, type Word} from '../../captions/WordCaptions';
import words from '../../../public/audio/mailed-himself-home/words.json';
import {SHOTLIST} from './kit';
import {Shots} from './Video';

// STATE 8: shots + VO + music bed (ducked) + SFX + one-word captions (A7, A9).
const SLUG = 'mailed-himself-home';
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Caption words: emphasis from the shot plan; each word holds until the next one starts (no blank flashes). */
export const CAPTION_WORDS: Word[] = (() => {
  const w = words as {text: string; startMs: number; endMs: number}[];
  return w.map((x, i) => {
    const start = x.startMs / 1000;
    const next = w[i + 1]?.startMs ?? x.endMs + 400;
    const gap = next / 1000 - x.endMs / 1000;
    const end = gap < 0.45 ? next / 1000 : x.endMs / 1000 + 0.2;
    const shot = SHOTLIST.shots.find((s) => start >= s.start && start < s.end);
    const emphasis = Boolean(shot?.emphasis?.some((e: string) => norm(e) === norm(x.text)));
    return {text: x.text, start, end, emphasis};
  });
})();

/** True while the narrator is speaking (±0.12 s around words). */
const speaking = (t: number) => (words as {startMs: number; endMs: number}[]).some((x) => t >= x.startMs / 1000 - 0.12 && t <= x.endMs / 1000 + 0.12);

/** Music bed sits ≈ 20 dB under the VO and ducks a little more under speech (A9). */
const musicVolume = (frame: number, fps: number) => (speaking(frame / fps) ? 0.085 : 0.14);

type Cue = {name: string; at: number};
const CUES: Cue[] = SHOTLIST.shots.flatMap((s) =>
  (s.sfx ?? []).map((c: string) => {
    const [name, sec] = c.split('@');
    return {name, at: s.start + Number(sec)};
  }),
);
const SFX_GAIN: Record<string, number> = {crickets: 0.35, 'clock-tick': 0.4, 'foghorn-soft': 0.45, 'flashback-shimmer': 0.4, 'plane-whoosh': 0.5, 'car-pass': 0.5};

export const Full: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Shots />
      <WordCaptions words={CAPTION_WORDS} />
      <Audio src={staticFile(`audio/${SLUG}/vo.wav`)} />
      <Audio src={staticFile(`music/${SLUG}_bed.wav`)} volume={(f) => musicVolume(f, fps)} />
      {CUES.map((c, i) => (
        <Sequence key={i} from={Math.round(c.at * fps)} layout="none">
          <Audio src={staticFile(`sfx/${c.name}.wav`)} volume={SFX_GAIN[c.name] ?? 0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const DURATION_FRAMES = (fps: number) => Math.round(SHOTLIST.duration * fps);
