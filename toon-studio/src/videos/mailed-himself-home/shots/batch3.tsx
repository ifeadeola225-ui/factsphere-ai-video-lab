import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Character} from '../../../characters/Character';
import {blinkAt} from '../../../characters/Face';
import {POSES} from '../../../characters/poses';
import {C} from '../../../engine/palette';
import {mulberry32} from '../../../engine/rng';
import {CRATE, Crate, Invoice, Parcel, Phone, Torch, WallClock} from '../../../props/story';
import {SETS} from '../../../sets/library';
import {Box, Glow, makeAnchors} from '../../../sets/kit';
import {SmallRoom} from '../../../sets/SmallRoom';
import {AIRFIELD_ANCHORS, Airfield, CRATE_INTERIOR_ANCHORS, CrateInterior, WAREHOUSE_ANCHORS, Warehouse, skyFor} from '../../../sets/story';
import {GUESTS} from '../guests';
import {Actor, ShotScene, headOf, useShotTime, type Shot} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const HeatHaze: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(255,150,60,0.22), rgba(255,200,120,0.0) 55%)', mixBlendMode: 'multiply', pointerEvents: 'none'}} />
);

/** s17 — "for four hours.": time-lapse; the sun arcs over and the crate's shadow sweeps around it. */
export const S17: React.FC<{shot: Shot}> = ({shot}) => {
  const {t} = useShotTime();
  const dur = shot.end - shot.start;
  const a = interpolate(t, [0, dur], [-1.1, 1.1], {...clamp, easing: Easing.inOut(Easing.sin)});
  const sun: [number, number, number] = [Math.sin(a) * 16, 9 + Math.cos(a) * 9, 6];
  return (
    <ShotScene
      shot={shot}
      anchors={AIRFIELD_ANCHORS}
      light="hot"
      background={skyFor('hot-bombay')}
      fog={{color: '#F6D5A0', near: 30, far: 120}}
      focus={[0, 2.4, 0]}
      keyPos={sun}
      overlay={<HeatHaze />}
    >
      <Airfield variant="hot-bombay" />
      <Crate position={[0, CRATE.H + 0.14, 0]} rotation={[0, 0.45, Math.PI]} lid={0} />
      {/* the sun disc moves across the sky with the light */}
      <Glow p={[Math.sin(a) * 45, 18 + Math.cos(a) * 14, -60]} color={'#FFE08A'} intensity={2.6}>
        <circleGeometry args={[3.2, 32]} />
      </Glow>
    </ShotScene>
  );
};

/** s18 — inside the upside-down crate: Reg on his head, top off, sweating, torch on the floor. */
const S18_ANCHORS = {
  ...CRATE_INTERIOR_ANCHORS,
  close: {
    '9x16': {pos: [0.3, 2.4, 7.8], target: [0, 2.3, 0], fov: 48},
    '16x9': {pos: [0.4, 2.2, 7.0], target: [0, 2.1, 0], fov: 44},
  },
} as typeof CRATE_INTERIOR_ANCHORS;

const SweatDrops: React.FC<{t: number}> = ({t}) => {
  const r = mulberry32(5);
  const drops = Array.from({length: 7}).map(() => [(r() - 0.5) * 1.6, r(), r() * 0.8] as const);
  return (
    <group>
      {drops.map(([x, ph, z], i) => {
        const k = (t * 1.4 + ph) % 1;
        // upside down: drops fall from the head (near the floor) to the floor
        return (
          <mesh key={i} position={[x, 2.4 - k * 2.2, 0.9 + z]} scale={[1, 1.4, 1]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshToonMaterial color={'#9CD3F0'} />
          </mesh>
        );
      })}
    </group>
  );
};

export const S18: React.FC<{shot: Shot}> = ({shot}) => {
  const {frame, fps, t} = useShotTime();
  const g = GUESTS['reg-tee'];
  return (
    <ShotScene shot={shot} anchors={S18_ANCHORS} light="nightInterior" background={'#3A2414'} focus={[0, 1.3, 0]} bokeh={3}>
      <CrateInterior />
      {/* Reg upside down: feet against the crate's floor (now the ceiling), head near the lid */}
      <group position={[0, 6.45, 0]} rotation={[0, 0, Math.PI]}>
        <Character
          look={g.look}
          joints={{...POSES.stand, lArm: {out: 1.1, fwd: 0.2, elbowIn: 0.6, elbowFwd: 0}, rArm: {out: 1.1, fwd: 0.2, elbowIn: 0.6, elbowFwd: 0}, headPitch: Math.sin(t * 2) * 0.05}}
          expression="worried"
          blink={blinkAt(frame, fps, 3)}
        />
      </group>
      {/* the tossed-off tracksuit top and the torch on the floor */}
      <Box p={[-1.3, 0.12, 0.6]} s={[1.0, 0.2, 0.7]} c={'#1F7A3A'} r={[0, 0.5, 0.1]} ink={0.02} />
      <Box p={[-1.3, 0.24, 0.6]} s={[0.12, 0.04, 0.6]} c={C.warmYellow} r={[0, 0.5, 0.1]} ink={0} />
      <Torch position={[1.2, 0.15, 0.7]} rotation={[0, 2.6, 0]} on={1} />
      <SweatDrops t={t} />
    </ShotScene>
  );
};

/** s19 / s20 — London at night: John by a silent phone, clock ticking. */
const JOHN: [number, number, number] = [2.4, 0, -1.4];
const JOHN_ANCHORS = makeAnchors([JOHN[0] - 0.3, 0, JOHN[2]]);
const NightRoom: React.FC = () => {
  const {frame, fps} = useShotTime();
  return (
    <>
      <SmallRoom night />
      <Phone position={[3.5, 2.47, -3.2]} rotation={[0, -0.4, 0]} />
      <WallClock position={[-0.6, 7.2, -5.85]} frame={frame} fps={fps} speed={6} />
    </>
  );
};
const NIGHT = {light: 'nightInterior' as const, background: '#3E3A5A', fog: {color: '#2E3050', near: 22, far: 60}};

export const S19: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={JOHN_ANCHORS} {...NIGHT} focus={headOf(JOHN, 'john')}>
    <NightRoom />
    <Actor id="john" position={JOHN} facing={-0.35} expression="worried" tweak={(j) => ({...j, headYaw: 0.5, headPitch: 0.15})} />
  </ShotScene>
);

export const S20: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={JOHN_ANCHORS} {...NIGHT} focus={headOf(JOHN, 'john')}>
    <NightRoom />
    <Actor id="john" action="shake" actionStart={0.35} position={JOHN} facing={-0.1} expression="sad" />
  </ShotScene>
);

/** Warm sepia tint + soft vignette for the flashback. */
const Flashback: React.FC = () => {
  const {t} = useShotTime();
  const flash = interpolate(t, [0, 0.25], [0.6, 0], clamp);
  return (
    <>
      <AbsoluteFill style={{background: 'rgba(196,140,70,0.22)', mixBlendMode: 'multiply', pointerEvents: 'none'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px 60px rgba(70,40,10,0.55)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: `rgba(255,248,230,${flash})`, pointerEvents: 'none'}} />
    </>
  );
};

/** s21 — flashback: Reg in a cargo cap carrying parcels across the warehouse. */
export const S21: React.FC<{shot: Shot}> = ({shot}) => {
  const {t} = useShotTime();
  const start: [number, number, number] = [-3.6, 0, 0.4];
  const x = start[0] + t * 2.6 * 0.7;
  return (
    <ShotScene shot={shot} anchors={WAREHOUSE_ANCHORS} light="interior" background="#B9C6D0" fog={{color: '#D2DAE0', near: 20, far: 60}} focus={[x, 5.2, 0.4]} overlay={<Flashback />}>
      <Warehouse variant="london-flashback" />
      <Actor
        id="reg-cargo"
        action="carry"
        position={start}
        facing={Math.PI / 2}
        expression="smile"
        holding={<Parcel position={[0.35, -0.2, 0.2]} s={0.9} />}
      />
    </ShotScene>
  );
};

/** s22 — Reg points at a C.O.D. tag on a parcel, smug. */
export const S22: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={WAREHOUSE_ANCHORS} light="interior" background="#B9C6D0" fog={{color: '#D2DAE0', near: 20, far: 60}} focus={headOf()} overlay={<Flashback />}>
    <Warehouse variant="london-flashback" />
    <Box p={[-1.8, 1.65, 1.0]} s={[1.8, 3.3, 1.6]} c={'#A9783F'} ink={0.025} />
    <Parcel position={[-1.8, 3.85, 1.0]} s={1.5} tag rotation={[0, 0.25, 0]} />
    <Actor id="reg-cargo" pose="hipLeft" action="point" actionStart={0.15} expression="smug" facing={-0.25} />
  </ShotScene>
);

/** s23 — the receiving clerk (Mr. Bramble) gasps at the bill. */
const Office = SETS.find((s) => s.id === 'office')!;
export const S23: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={Office.anchors} light="interior" background={Office.background} fog={Office.fog} focus={headOf([0, 0, 0], 'bramble')}>
    <Office.Component />
    <Actor id="bramble" action="gasp" actionStart={0.3} expression="neutral" holding={<Invoice length={0.9} />} />
  </ShotScene>
);
