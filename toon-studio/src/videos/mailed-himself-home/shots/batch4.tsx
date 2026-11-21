import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {Character} from '../../../characters/Character';
import {blinkAt} from '../../../characters/Face';
import {motion} from '../../../characters/motions';
import {POSES, mix} from '../../../characters/poses';
import {C} from '../../../engine/palette';
import {hashSeed} from '../../../engine/rng';
import {GRADIENT_SET} from '../../../engine/toon';
import {Balloon, Bunting, Cake, Crate, Pocketknife} from '../../../props/story';
import {SETS} from '../../../sets/library';
import {Box, Cyl} from '../../../sets/kit';
import {SMALL_ROOM_ANCHORS, SmallRoom} from '../../../sets/SmallRoom';
import {ROAD_ANCHORS, OutbackRoad, WAREHOUSE_ANCHORS, Warehouse} from '../../../sets/story';
import {GUESTS} from '../guests';
import {Actor, ShotScene, headOf, useShotTime, type Shot} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const NIGHT_WH = {light: 'night' as const, background: '#2E3050', fog: {color: '#2E3050', near: 18, far: 60}};

/** s24 — "Sixty-three hours later, in Perth,": the crate alone in a moonlit cargo shed. */
export const S24: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={WAREHOUSE_ANCHORS} {...NIGHT_WH} focus={[0, 2.5, 0]} bloom={0.8}>
    <Warehouse variant="perth-night" />
    <Crate position={[0, 0, 0]} lid={0} />
  </ShotScene>
);

/** s25 — a blade pokes through, the front panel falls, Reg rises out and stretches. */
export const S25: React.FC<{shot: Shot}> = ({shot}) => {
  const {frame, fps, t} = useShotTime();
  const g = GUESTS['reg-tee'];
  const seed = hashSeed('reg-tee');
  // knife: pokes out at 0.15 s, saws, retracts at 0.75 s
  const knifeOut = interpolate(t, [0.12, 0.25, 0.7, 0.8], [0, 1, 1, 0], clamp);
  const saw = Math.sin(t * 30) * 0.12 * knifeOut;
  const fall = spring({frame: frame - Math.round(0.85 * fps), fps, config: {damping: 14, stiffness: 140}});
  // rise from sitting to standing and step forward out of the crate, then stretch
  const rise = interpolate(t, [1.0, 1.4], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const sit = motion('sit', frame, fps, 0, seed);
  const stretch = spring({frame: frame - Math.round(1.35 * fps), fps, config: {damping: 12, stiffness: 120}});
  const joints = mix(mix(sit.joints, POSES.stand, rise), {...POSES.armsUp, headPitch: -0.1}, stretch);
  const pos: [number, number, number] = [0, 0, -0.45 + rise * 2.6];
  const rootY = sit.rootY * (1 - rise);
  return (
    <ShotScene shot={shot} anchors={WAREHOUSE_ANCHORS} {...NIGHT_WH} focus={headOf(pos, 'reg-tee', rootY)} bloom={0.8}>
      <Warehouse variant="perth-night" />
      <Crate position={[0, 0, 0]} lid={0} front={fall} />
      {knifeOut > 0.01 ? <Pocketknife position={[0.6 + saw, 2.6, 1.4 + 0.2 * knifeOut]} rotation={[0, -Math.PI / 2, Math.PI / 2]} /> : null}
      <Character
        look={g.look}
        joints={joints}
        expression={t > 1.3 ? 'happy' : 'smug'}
        blink={blinkAt(frame, fps, seed)}
        position={pos}
        rootY={rootY}
      />
    </ShotScene>
  );
};

/** A boxy 1960s-ish car at REAL scale (Reg ≈ 1.8 m = 6.3 units → ~4.6 m long, ~1.5 m tall). No branding. */
const Car: React.FC<{z: number}> = ({z}) => (
  <group position={[6.0, 0, z]} rotation={[0, Math.PI, 0]}>
    <Box p={[0, 1.9, 0]} s={[6.0, 2.2, 15.5]} c={C.teal} ink={0.06} />
    <Box p={[0, 4.0, -1.0]} s={[5.4, 2.0, 7.5]} c={C.teal} ink={0.06} />
    <Box p={[0, 4.0, 2.78]} s={[4.9, 1.6, 0.08]} c={'#2A3A55'} ink={0} />
    <Box p={[3.04, 4.0, -1.0]} s={[0.08, 1.5, 6.6]} c={'#2A3A55'} ink={0} />
    <Box p={[-3.04, 4.0, -1.0]} s={[0.08, 1.5, 6.6]} c={'#2A3A55'} ink={0} />
    {[-1.9, 1.9].map((x) => (
      <Box key={x} p={[x, 1.9, 7.78]} s={[1.1, 0.6, 0.08]} c={'#FFF1B8'} ink={0} />
    ))}
    {[
      [-3.0, -4.9],
      [3.0, -4.9],
      [-3.0, 4.9],
      [3.0, 4.9],
    ].map(([x, zz], i) => (
      <Cyl key={i} p={[x, 1.1, zz]} r1={1.1} h={0.9} c={'#1C1C1C'} rot={[0, 0, Math.PI / 2]} ink={0.04} seg={18} />
    ))}
  </group>
);

/** s26 — the outback: thumb out at the roadside; a car zooms past toward Adelaide. */
export const S26: React.FC<{shot: Shot}> = ({shot}) => {
  const {t} = useShotTime();
  const carZ = interpolate(t, [0.5, 1.8], [30, -80], {...clamp, easing: Easing.in(Easing.quad)});
  return (
    <ShotScene shot={shot} anchors={ROAD_ANCHORS} light="day" background="#9CCBEA" fog={{color: '#F3E2C0', near: 40, far: 140}} focus={headOf()} bokeh={3}>
      <OutbackRoad />
      <Car z={carZ} />
      <Actor
        id="reg"
        expression={t > 1.3 ? 'worried' : 'smile'}
        facing={0.35}
        tweak={(j) => ({...j, lArm: {out: 1.45, fwd: 0.35, elbowIn: -0.25, elbowFwd: 0}, headYaw: t > 1.2 ? 0.7 : 0.3})}
      />
    </ShotScene>
  );
};

/** Party dressing on top of the small room: bunting, balloons, a cake on a little table. */
const PartyRoom: React.FC = () => {
  const {frame} = useShotTime();
  return (
    <>
      <SmallRoom />
      <Bunting y={8.4} z={-5.6} w={16} />
      {[
        [-5.2, 6.4, -4.8, C.red],
        [-4.2, 7.1, -5.0, C.warmYellow],
        [5.6, 6.8, -4.6, C.teal],
        [6.4, 6.1, -4.2, C.turquoise],
      ].map(([x, y, z, c], i) => (
        <Balloon key={i} position={[x as number, y as number, z as number]} c={c as string} frame={frame} seed={i * 1.7} />
      ))}
      <group position={[3.0, 0, 0.6]}>
        <Box p={[0, 1.7, 0]} s={[2.4, 0.15, 1.6]} c={C.white} ink={0.02} />
        <Box p={[0, 0.85, 0]} s={[2.2, 1.6, 1.4]} c={C.burgundy} ink={0.02} />
        <Cake position={[0, 1.78, 0]} />
      </group>
    </>
  );
};
const PARTY = {light: 'interior' as const, background: C.wallButter, fog: {color: '#F3E2C0', near: 22, far: 60}};

/** s27 — "He makes the birthday.": Reg and his daughter jump for joy. */
export const S27: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={SMALL_ROOM_ANCHORS} {...PARTY} focus={headOf([0.9, 0, 0.6], 'daughter')} bloom={0.7}>
    <PartyRoom />
    <Actor id="reg" action="jump" actionStart={0.05} position={[-1.1, 0, 0]} facing={0.3} expression="happy" />
    <Actor id="daughter" action="jump" actionStart={0.15} position={[0.9, 0, 0.6]} facing={-0.35} expression="happy" />
  </ShotScene>
);

/** s28 — Mr. Bramble unrolls an absurdly long bill all the way to the floor. */
const Office = SETS.find((s) => s.id === 'office')!;
export const S28: React.FC<{shot: Shot}> = ({shot}) => {
  const {t} = useShotTime();
  const len = interpolate(t, [0.2, 1.4], [0.6, 4.3], {...clamp, easing: Easing.out(Easing.quad)});
  const top: [number, number, number] = [-1.95, 4.65, 0.55];
  return (
    <ShotScene shot={shot} anchors={Office.anchors} light="interior" background={Office.background} fog={Office.fog} focus={headOf([0, 0, 0], 'bramble')}>
      <Office.Component />
      <Actor
        id="bramble"
        action="talk"
        expression="angry"
        tweak={(j) => ({...j, rArm: {out: 1.55, fwd: 0.45, elbowIn: 0.0, elbowFwd: 0.1}})}
      />
      {/* the bill: hangs from his raised hand, unrolling to the floor (curls at the bottom) */}
      <group position={top}>
        <mesh position={[0, -len / 2, 0]}>
          <planeGeometry args={[0.75, len]} />
          <meshToonMaterial color={C.white} gradientMap={GRADIENT_SET} side={2} />
        </mesh>
        {Array.from({length: Math.floor(len / 0.22)}).map((_, i) => (
          <mesh key={i} position={[-0.06, -0.3 - i * 0.22, 0.012]}>
            <planeGeometry args={[0.5, 0.035]} />
            <meshBasicMaterial color={'#9FB0B8'} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, -len, 0.18]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.75, 16, 1, true]} />
          <meshToonMaterial color={C.white} gradientMap={GRADIENT_SET} side={2} />
        </mesh>
      </group>
    </ShotScene>
  );
};

/** s29 — "He never paid it.": smug look to camera at the party; holds through the tail. */
export const S29: React.FC<{shot: Shot}> = ({shot}) => (
  <ShotScene shot={shot} anchors={SMALL_ROOM_ANCHORS} {...PARTY} focus={headOf()} bloom={0.7}>
    <PartyRoom />
    <Actor id="reg" pose="hipsBoth" expression="smug" tweak={(j) => ({...j, headRoll: 0.08})} />
  </ShotScene>
);
