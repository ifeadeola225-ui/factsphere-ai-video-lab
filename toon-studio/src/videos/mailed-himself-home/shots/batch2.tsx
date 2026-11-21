import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring} from 'remotion';
import {C} from '../../../engine/palette';
import {CRATE, Crate, EmptyBottle, Hammer, LuggageCart, RubberStamp, Tin, Torch, WaterBottle} from '../../../props/story';
import {Box} from '../../../sets/kit';
import {AIRFIELD_ANCHORS, Airfield, WAREHOUSE_ANCHORS, Warehouse, skyFor} from '../../../sets/story';
import {Actor, ShotScene, headOf, useShotTime, type Shot} from '../kit';

const WH = {light: 'interior' as const, background: '#B9C6D0', fog: {color: '#D2DAE0', near: 20, far: 60}};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const IN_CRATE: [number, number, number] = [0, 0, -0.45];
const HandsDown = (j: import('../../../characters/poses').Joints) => ({...j, lArm: {out: 0.15, fwd: 0.4, elbowIn: 0.3, elbowFwd: 0.4}, rArm: {out: 0.15, fwd: 0.4, elbowIn: 0.3, elbowFwd: 0.4}});

/** Pop-in scale (spring overshoot) at a time in seconds. */
const usePop = (atSec: number) => {
  const {frame, fps} = useShotTime();
  return spring({frame: frame - Math.round(atSec * fps), fps, config: {damping: 9, stiffness: 220}});
};

const PlankPile: React.FC<{p: [number, number, number]}> = ({p}) => (
  <group position={p}>
    {[0, 1, 2, 3].map((i) => (
      <Box key={i} p={[0, 0.1 + i * 0.2, (i % 2) * 0.1]} s={[3.2, 0.18, 0.55]} c={'#C89B62'} r={[0, (i % 2 ? 0.08 : -0.05), 0]} ink={0.02} />
    ))}
  </group>
);

/** s09 — John hammers the crate together; Reg watches, hands on hips. */
export const S09: React.FC<{shot: Shot}> = ({shot}) => {
  const john: [number, number, number] = [-2.7, 0, 0.5];
  return (
    <ShotScene shot={shot} anchors={WAREHOUSE_ANCHORS} {...WH} focus={headOf(john, 'john')}>
      <Warehouse variant="london" />
      <Crate position={[0, 0, -0.8]} lid={1} label={false} thisWayUp={false} />
      <PlankPile p={[-3.6, 0, 2.6]} />
      <Actor id="john" action="tap" position={john} facing={1.25} expression="thinking" holding={<Hammer />} />
      <Actor id="reg" pose="hipsBoth" position={[2.8, 0, 0.2]} facing={-0.55} expression="smile" />
    </ShotScene>
  );
};

/** s10 — just big enough: Reg squeezed in, knees up; John nods approval. */
export const S10: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={WAREHOUSE_ANCHORS} {...WH} focus={headOf(IN_CRATE, 'reg', -1.0 + 0.25)}>
    <Warehouse variant="london" />
    <Crate position={[0, 0, 0]} lid={1} label={false} />
    <Actor id="reg" action="sit" position={IN_CRATE} rootY={0.25} expression="worried" tweak={(j) => ({...HandsDown(j), lKnee: j.lKnee + 0.35, rKnee: j.rKnee + 0.35, lLeg: j.lLeg - 0.25, rLeg: j.rLeg - 0.25})} />
    <Actor id="john" action="nod" actionStart={0.6} position={[-3.0, 0, 0.8]} facing={0.6} expression="smile" />
  </ShotScene>
);

/** s11 — supplies pop into his raised hands on "food" and "water". */
export const S11: React.FC<{shot: Shot}> = ({shot}) => {
  const food = usePop(1.18);
  const water = usePop(1.81);
  const up = usePop(0.9);
  return (
    <ShotScene shot={shot} anchors={WAREHOUSE_ANCHORS} {...WH} focus={headOf(IN_CRATE, 'reg', -1.0 + 1.3)}>
      <Warehouse variant="london" />
      <Crate position={[0, 0, 0]} lid={1} label={false} />
      <Actor
        id="reg"
        action="sit"
        position={IN_CRATE}
        rootY={1.3}
        expression="happy"
        holdingLeft={<group scale={food}><Tin position={[0, -0.25, 0.05]} c={C.red} s={1.4} /></group>}
        holding={<group scale={water}><WaterBottle position={[0, -0.35, 0.05]} s={1.4} /></group>}
        tweak={(j) => ({...j, lArm: {out: 0.7 + 0.5 * Math.min(1, up), fwd: 1.0, elbowIn: 0.7, elbowFwd: 0.2}, rArm: {out: 0.7 + 0.5 * Math.min(1, up), fwd: 1.0, elbowIn: 0.7, elbowFwd: 0.2}})}
      />
    </ShotScene>
  );
};

/** s12 — torch clicks on under his face; the empty bottle pops onto the rim; awkward look. */
export const S12: React.FC<{shot: Shot}> = ({shot}) => {
  const {t} = useShotTime();
  const on = t > 0.2 ? 1 : 0;
  const bottle = usePop(1.62);
  return (
    <ShotScene shot={shot} anchors={WAREHOUSE_ANCHORS} {...WH} light={on ? 'nightInterior' : 'interior'} focus={headOf(IN_CRATE, 'reg', -1.0 + 0.45)}>
      <Warehouse variant="london" />
      <Crate position={[0, 0, 0]} lid={1} label={false} />
      <Actor
        id="reg"
        action="sit"
        position={IN_CRATE}
        rootY={0.45}
        expression={t > 1.7 ? 'worried' : 'smug'}
        holding={<Torch position={[0, -0.05, 0.1]} rotation={[0, -Math.PI / 2, Math.PI / 2 + 0.6]} on={on} />}
        tweak={(j) => ({...j, rArm: {out: 0.35, fwd: 1.3, elbowIn: 1.5, elbowFwd: 0.5}, headYaw: t > 1.7 ? -0.3 : 0})}
      />
      <group position={[1.2, CRATE.H + 0.14, 0.9]} scale={bottle}>
        <EmptyBottle position={[0, 0, 0]} s={1.4} />
      </group>
    </ShotScene>
  );
};

/** s13 — insert: the rubber stamp slams CASH ON DELIVERY onto the crate on "cash". */
const INSERT = {
  insert_label: {
    '9x16': {pos: [0.2, 3.3, 15.5], target: [0, 3.0, 1.4], fov: 30},
    '16x9': {pos: [0.3, 3.2, 6.6], target: [0, 3.0, 1.4], fov: 30},
  },
} as const;
export const S13: React.FC<{shot: Shot}> = ({shot}) => {
  const {t} = useShotTime();
  const slam = 1.0;
  // stamp: hovers, pulls back, slams into the front face at `slam`, lifts away
  const z = interpolate(t, [0, slam - 0.25, slam, slam + 0.15], [3.4, 3.8, CRATE.D / 2 + 0.36, CRATE.D / 2 + 0.36], {...clamp, easing: Easing.inOut(Easing.quad)});
  // after the slam the stamp lifts straight up and out of frame (never back toward the lens)
  const lift = interpolate(t, [slam + 0.15, slam + 0.55], [0, 5], {...clamp, easing: Easing.in(Easing.quad)});
  const stamped = t >= slam;
  const pop = spring({frame: Math.round((t - slam) * 30), fps: 30, config: {damping: 10, stiffness: 260}});
  return (
    <ShotScene shot={shot} anchors={INSERT as never} {...WH} focus={[0, 3.0, 1.4]} bokeh={6}>
      <Warehouse variant="london" />
      {/* one crate; its COD label appears (with a pop) the instant the stamp lands */}
      <group scale={stamped ? [1 + (pop - 1) * 0.04, 1 + (pop - 1) * 0.04, 1] : [1, 1, 1]}>
        <Crate position={[0, 0, 0]} lid={0} label={stamped} thisWayUp={false} />
      </group>
      <group position={[0, 3.0 + lift, z]} rotation={[Math.PI / 2, 0, 0]}>
        <RubberStamp position={[0, -0.0, 0]} />
      </group>
    </ShotScene>
  );
};

/** s14 — thick fog: the plane waits, the crate sits on a cart. */
export const S14: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={AIRFIELD_ANCHORS} light="fog" background={'#D9E1E6'} fog={{color: '#D9E1E6', near: 14, far: 110}} focus={[0, 3, 0]} bokeh={3}>
    <Airfield variant="fog" cart={false} />
    <LuggageCart position={[0, 0, 0]} rotation={[0, 0.2, 0]} />
    <Crate position={[0, 0.86, 0]} rotation={[0, 0.2, 0]} lid={0} />
  </ShotScene>
);

const HOT = {light: 'hot' as const, background: skyFor('hot-bombay'), fog: {color: '#F6D5A0', near: 30, far: 120}};
const HeatHaze: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(255,150,60,0.22), rgba(255,200,120,0.0) 55%)', mixBlendMode: 'multiply', pointerEvents: 'none'}} />
);

const S15_ANCHORS = {
  ...AIRFIELD_ANCHORS,
  mid: {
    '9x16': {pos: [-7, 4.6, 12], target: [2.5, 3.4, 0], fov: 42},
    '16x9': {pos: [-7.5, 4.6, 12], target: [2.5, 3.4, 0], fov: 36},
  },
  wide: {
    '9x16': {pos: [-7, 4.6, 12], target: [2.5, 3.4, 0], fov: 42},
    '16x9': {pos: [-7.5, 4.6, 12], target: [2.5, 3.4, 0], fov: 36},
  },
} as typeof AIRFIELD_ANCHORS;

/** s15 — Bombay: two workers carry the crate in. */
export const S15: React.FC<{shot: Shot}> = ({shot}) => {
  const {t} = useShotTime();
  const travel = Math.min(t, 1.7) * 2.6 * 0.7;
  const x = 5.6 - travel;
  const carryJ = (j: import('../../../characters/poses').Joints) => ({...j, lArm: {out: 0.2, fwd: 1.25, elbowIn: 0.3, elbowFwd: 0.1}, rArm: {out: 0.2, fwd: 1.25, elbowIn: 0.3, elbowFwd: 0.1}});
  // the leading worker carries his end behind him
  const carryBack = (j: import('../../../characters/poses').Joints) => ({...j, lean: 0.1, lArm: {out: 0.25, fwd: -0.75, elbowIn: 0.2, elbowFwd: -0.1}, rArm: {out: 0.25, fwd: -0.75, elbowIn: 0.2, elbowFwd: -0.1}});
  const walking = t < 1.7;
  return (
    <ShotScene shot={shot} anchors={S15_ANCHORS} {...HOT} focus={[x, 3.4, 0]} overlay={<HeatHaze />}>
      <Airfield variant="hot-bombay" />
      <Crate position={[x, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} lid={0} scale={0.9} />
      <Actor id="worker1" action={walking ? 'carry' : 'idle'} position={[x - 2.1 + travel, 0, 0]} facing={-Math.PI / 2} expression="neutral" tweak={carryBack} />
      <Actor id="worker2" action={walking ? 'carry' : 'idle'} position={[x + 2.1 + travel, 0, 0]} facing={-Math.PI / 2} expression="neutral" tweak={carryJ} />
    </ShotScene>
  );
};

/** s16 — the crate, upside down on the scorching runway; a worker strolls away. */
export const S16: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={AIRFIELD_ANCHORS} {...HOT} focus={[0, 2.4, 0]} overlay={<HeatHaze />}>
    <Airfield variant="hot-bombay" />
    <Crate position={[0, CRATE.H + 0.14, 0]} rotation={[0, 0.45, Math.PI]} lid={0} />
    <Actor id="worker1" action="walk" position={[-3.0, 0, 0.5]} facing={-Math.PI / 2 + 0.35} expression="smile" />
  </ShotScene>
);
