import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {POSES, mix, springAt} from '../../../characters/poses';
import {C} from '../../../engine/palette';
import {Calendar, Crate, Javelin, PhotoCard, Rain, Wallet} from '../../../props/story';
import {SETS} from '../../../sets/library';
import {SMALL_ROOM_ANCHORS, SmallRoom} from '../../../sets/SmallRoom';
import {AIRFIELD_ANCHORS, Airfield, skyFor} from '../../../sets/story';
import {makeAnchors} from '../../../sets/kit';
import {Actor, ShotScene, headOf, useShotTime, type Shot} from '../kit';

const Street = SETS.find((s) => s.id === 'street')!;
const LONDON_DAY = {light: 'overcast' as const, background: skyFor('day-london'), fog: {color: '#DCE4EA', near: 30, far: 110}};
const GREY = {light: 'overcast' as const, background: '#B9C4CC', fog: {color: '#B9C4CC', near: 14, far: 70}};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const IN_CRATE: [number, number, number] = [0, 0, -0.45]; // sitting inside: feet stay within the front panel
const HEAD_IN_CRATE = (extra: number) => headOf(IN_CRATE, 'reg', -1.0 + extra);
const S01_ANCHORS = {
  ...AIRFIELD_ANCHORS,
  low_fg: {
    '9x16': {pos: [3.4, 3.2, 15], target: [0.2, 4.6, -4], fov: 42},
    '16x9': {pos: [4, 3.4, 16], target: [1.5, 4.8, -4], fov: 38},
  },
  wide: {
    '9x16': {pos: [3.4, 3.2, 15], target: [0.2, 4.6, -4], fov: 42},
    '16x9': {pos: [4.5, 3.6, 17], target: [2.5, 5.0, -5], fov: 40},
  },
} as typeof AIRFIELD_ANCHORS;

const HandsDown = (j: import('../../../characters/poses').Joints) => ({...j, lArm: {out: 0.15, fwd: 0.4, elbowIn: 0.3, elbowFwd: 0.4}, rArm: {out: 0.15, fwd: 0.4, elbowIn: 0.3, elbowFwd: 0.4}});

/** s01 — "In 1964 a man flew from London": Reg's head pokes out of an open crate beside the airliner. */
export const S01: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={S01_ANCHORS} {...LONDON_DAY} focus={HEAD_IN_CRATE(0.4)}>
    <Airfield variant="day-london" />
    <Crate position={[0, 0, 0]} lid={1} />
    <Actor id="reg" action="sit" expression="smug" position={IN_CRATE} rootY={0.4} tweak={HandsDown} />
  </ShotScene>
);

/** s02 — "to Australia with no ticket.": Reg shrugs, pockets empty. */
export const S02: React.FC<{shot: Shot}> = ({shot}) => {
  const {frame, fps} = useShotTime();
  const s = springAt(frame, fps, 0.35, 12);
  return (
    <ShotScene shot={shot} anchors={AIRFIELD_ANCHORS} {...LONDON_DAY} focus={headOf()}>
      <Airfield variant="day-london" />
      <Actor id="reg" expression={frame / fps > 0.4 ? 'worried' : 'neutral'} tweak={(j) => mix(j, {...j, ...POSES.shrug, headRoll: 0.12}, s)} />
    </ShotScene>
  );
};

/** s03 — "He mailed himself.": closed COD crate; lid pops, Reg peeks out smugly. */
export const S03: React.FC<{shot: Shot}> = ({shot}) => {
  const {frame, fps} = useShotTime();
  const lid = spring({frame: frame - Math.round(0.3 * fps), fps, config: {damping: 11, stiffness: 160}}) * 0.6;
  const peek = springAt(frame, fps, 0.4, 12, 170);
  const rootY = -1.3 + peek * 1.6;
  return (
    <ShotScene shot={shot} anchors={AIRFIELD_ANCHORS} {...LONDON_DAY} focus={HEAD_IN_CRATE(0.3)}>
      <Airfield variant="day-london" />
      <Crate position={[0, 0, 0]} lid={lid} />
      <Actor id="reg" action="sit" expression="smug" position={IN_CRATE} rootY={rootY} tweak={HandsDown} />
    </ShotScene>
  );
};

/** s04 — "Reg Spiers, a javelin thrower,": proud stance holding the javelin upright, then he flings it. */
export const S04: React.FC<{shot: Shot}> = ({shot}) => {
  const {t} = useShotTime();
  const release = 1.35;
  const flying = t >= release;
  const k = Math.max(0, t - release);
  return (
    <ShotScene shot={shot} anchors={Street.anchors} light="day" background="#BFE0F5" fog={Street.fog} focus={headOf()}>
      <Street.Component />
      <Actor
        id="reg"
        pose="hipLeft"
        action={flying ? 'point' : 'idle'}
        actionStart={release}
        expression="smug"
        facing={-0.35}
        holding={flying ? null : <Javelin tilt={-0.35} fwd={0.35} />}
        tweak={(j) => (flying ? j : {...j, rArm: {out: 0.42, fwd: 0.35, elbowIn: 0.05, elbowFwd: 0.15}})}
      />
      {flying ? (
        <group position={[-1.2 - k * 16, 4.4 + k * 7 - k * k * 3, 0.4 - k * 4]} rotation={[0, 0, 1.3 - k * 0.4]}>
          <Javelin />
        </group>
      ) : null}
    </ShotScene>
  );
};

const BENCH: [number, number, number] = [-6.8, 0, -1.4];
const BENCH_ANCHORS = makeAnchors([BENCH[0], 0, BENCH[2]], {
  wide: {
    '9x16': {pos: [-1.6, 5.2, 13], target: [0, 3.0, 0], fov: 38},
    '16x9': {pos: [-2.2, 5.0, 14], target: [0.6, 3.0, 0], fov: 34},
  },
});

/** s05 — "is stuck in London.": alone on a bench in the drizzle. */
export const S05: React.FC<{shot: Shot}> = ({shot}) => {
  const {frame} = useShotTime();
  return (
    <ShotScene shot={shot} anchors={BENCH_ANCHORS} {...GREY} focus={headOf(BENCH, 'reg', -1.0)}>
      <Street.Component />
      <Actor id="reg" action="sit" expression="sad" position={BENCH} tweak={(j) => ({...j, headPitch: 0.18})} />
      <Rain frame={frame} center={[BENCH[0], 0, 2]} />
    </ShotScene>
  );
};

/** s06 — "Thieves took his wallet": the thief snatches it and runs off left. */
export const S06: React.FC<{shot: Shot}> = ({shot}) => {
  const {frame, fps, t} = useShotTime();
  const snatched = t > 0.45;
  const regPos: [number, number, number] = [2.0, 0, -0.4];
  // thief: walks in from the right behind Reg, then runs off to the left
  const thiefX = interpolate(t, [0, 0.45, 1.4], [3.4, 1.0, -5.0], {...clamp, easing: Easing.inOut(Easing.quad)});
  return (
    <ShotScene shot={shot} anchors={Street.anchors} {...GREY} focus={[thiefX, 5.2, -1.0]}>
      <Street.Component />
      <Actor id="reg" position={regPos} facing={0.35} expression={t > 0.8 ? 'shocked' : 'neutral'} />
      <Actor
        id="thief"
        action="walk"
        position={[thiefX, 0, -1.0]}
        facing={-0.6}
        expression="smug"
        holding={snatched ? <Wallet /> : null}
        tweak={(j) => ({...j, lean: 0.18})}
      />
      <Rain frame={frame} />
    </ShotScene>
  );
};

/** s07 — "and all his savings.": pats pockets, gasps. */
export const S07: React.FC<{shot: Shot}> = ({shot}) => {
  const {frame} = useShotTime();
  return (
    <ShotScene shot={shot} anchors={Street.anchors} {...GREY} focus={headOf()}>
      <Street.Component />
      <Actor id="reg" action="gasp" actionStart={0.15} expression="worried" />
      <Rain frame={frame} center={[0, 0, 3]} area={[16, 14, 10]} />
    </ShotScene>
  );
};

/** s08 — "And his daughter's birthday is coming.": photo in hand, circled calendar. */
export const S08: React.FC<{shot: Shot}> = ({shot}) => {
  const pos: [number, number, number] = [-1.2, 0, 0];
  return (
    <ShotScene shot={shot} anchors={SMALL_ROOM_ANCHORS} light="interior" background={C.wallButter} fog={{color: '#F3E2C0', near: 22, far: 60}} focus={headOf(pos)}>
      <SmallRoom />
      <Calendar position={[0.9, 5.8, -5.85]} />
      <Actor
        id="reg"
        position={pos}
        facing={0.25}
        expression="sad"
        holding={<PhotoCard />}
        tweak={(j) => ({...j, rArm: {out: 0.25, fwd: 1.15, elbowIn: 1.25, elbowFwd: 0.35}, headPitch: 0.22, headYaw: -0.15})}
      />
    </ShotScene>
  );
};
