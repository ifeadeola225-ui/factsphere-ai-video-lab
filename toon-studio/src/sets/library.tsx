import React from 'react';
import * as THREE from 'three';
import {Ink} from '../engine/Ink';
import {C} from '../engine/palette';
import {mulberry32} from '../engine/rng';
import {checkerTex, plasterTex, textTex} from '../engine/textures';
import {GRADIENT_SET} from '../engine/toon';
import {Box, Chair, Cyl, Door, Floor, Glow, PendantLamp, Plant, RoomShell, Sign, SkyBackdrop, T, Window, makeAnchors, type SetDef} from './kit';
import {SMALL_ROOM_ANCHORS, SmallRoom} from './SmallRoom';

// Starter sets (brief section 6, re-chosen for Oddly Human's topics). Character zone = origin.

/* ───────────────────────── 1. OFFICE ───────────────────────── */
const Office: React.FC = () => (
  <group>
    <Floor kind={{checker: ['#C9D3D8', '#B9C4CA']}} repeat={5} />
    <RoomShell wall={C.wallMint} side={C.wallCream} wainscot={C.navy} />
    <Window p={[-2.2, 5.6, -5.85]} w={4.2} />
    <Sign p={[2.8, 6.6, -5.85]} text="TEAM OF THE MONTH" w={2.4} h={0.8} bg={C.warmYellow} fg="#1E3A6E" />
    {/* wall clock */}
    <group position={[2.8, 4.9, -5.85]}>
      <Cyl p={[0, 0, 0.06]} r1={0.55} h={0.1} c={C.white} rot={[Math.PI / 2, 0, 0]} ink={0.03} seg={32} />
      <Box p={[0, 0.18, 0.14]} s={[0.05, 0.38, 0.02]} c={'#160502'} ink={0} shadow={false} />
      <Box p={[0.12, 0, 0.15]} s={[0.26, 0.05, 0.02]} c={'#160502'} ink={0} shadow={false} />
    </group>
    {/* desk with monitor (emissive screen) and office chair */}
    <group position={[4.4, 0, -3.2]}>
      <Box p={[0, 2.35, 0]} s={[4.4, 0.22, 1.9]} c={C.deskWood} />
      <Box p={[-1.9, 1.12, 0]} s={[0.4, 2.25, 1.7]} c={'#6E4428'} />
      <Box p={[1.9, 1.12, 0]} s={[0.4, 2.25, 1.7]} c={'#6E4428'} />
      <Box p={[0.2, 3.35, -0.4]} s={[1.9, 1.25, 0.12]} c={'#1C1C1C'} />
      <Glow p={[0.2, 3.35, -0.33]} color={'#8EC9EE'} intensity={0.9}>
        <planeGeometry args={[1.7, 1.05]} />
      </Glow>
      <Box p={[0.2, 2.6, -0.4]} s={[0.15, 0.4, 0.15]} c={'#1C1C1C'} ink={0.015} />
      <Box p={[0.2, 2.5, 0.25]} s={[1.3, 0.06, 0.45]} c={C.white} ink={0.015} />
      <Cyl p={[-1.3, 2.7, 0.3]} r1={0.2} r2={0.18} h={0.45} c={C.teal} ink={0.02} seg={16} />
    </group>
    <group position={[3.6, 0, -1.4]} rotation={[0, -0.5, 0]}>
      <Cyl p={[0, 1.2, 0]} r1={0.7} h={0.25} c={C.navy} seg={20} />
      <Box p={[0, 2.1, -0.6]} s={[1.3, 1.6, 0.2]} c={C.navy} />
      <Cyl p={[0, 0.6, 0]} r1={0.08} h={1.0} c={'#1C1C1C'} ink={0} />
      <Cyl p={[0, 0.08, 0]} r1={0.6} h={0.12} c={'#1C1C1C'} ink={0.015} />
    </group>
    {/* filing cabinet + water cooler (left) */}
    <group position={[-5.2, 0, -4.8]}>
      <Box p={[0, 1.9, 0]} s={[1.6, 3.8, 1.4]} c={'#9FB0B8'} />
      {[0.9, 2.1, 3.2].map((y) => (
        <Box key={y} p={[0, y, 0.73]} s={[0.6, 0.12, 0.08]} c={'#160502'} ink={0} />
      ))}
    </group>
    <group position={[-7, 0, -3]}>
      <Box p={[0, 1.4, 0]} s={[1.0, 2.8, 1.0]} c={C.white} />
      <Cyl p={[0, 3.45, 0]} r1={0.45} r2={0.4} h={1.3} c={'#9CD3F0'} ink={0.02} seg={20} />
    </group>
    <Plant p={[-3.8, 0, 6.2]} scale={1.4} />
    <PendantLamp p={[0, 9, -2]} />
  </group>
);

/* ───────────────────────── 2. HOSPITAL ROOM ───────────────────────── */
const Hospital: React.FC = () => (
  <group>
    <Floor kind={{checker: ['#E8EEF0', '#CFDCE0']}} repeat={6} />
    <RoomShell wall={C.wallMint} side={C.wallMint} wainscot={'#9ACFC8'} />
    <Window p={[3.2, 5.8, -5.85]} w={3.4} />
    {/* bed */}
    <group position={[-3.6, 0, -2.6]}>
      <Box p={[0, 1.55, 0]} s={[2.6, 0.5, 5.0]} c={C.white} />
      <Box p={[0, 2.0, 0]} s={[2.4, 0.4, 4.8]} c={'#CFE8F5'} ink={0.02} />
      <Box p={[0, 2.35, -1.8]} s={[1.6, 0.35, 0.9]} c={C.white} ink={0.02} />
      <Box p={[0, 2.25, 0.8]} s={[2.5, 0.28, 2.6]} c={C.turquoise} ink={0.02} />
      <Box p={[0, 2.3, -2.55]} s={[2.8, 2.2, 0.15]} c={'#9FB0B8'} />
      {[
        [-1.1, -2.2],
        [1.1, -2.2],
        [-1.1, 2.2],
        [1.1, 2.2],
      ].map(([x, z], i) => (
        <Cyl key={i} p={[x, 0.65, z]} r1={0.08} h={1.3} c={'#9FB0B8'} ink={0.015} seg={10} />
      ))}
    </group>
    {/* heart monitor with a glowing screen */}
    <group position={[-6.2, 0, -4.4]}>
      <Cyl p={[0, 1.8, 0]} r1={0.08} h={3.6} c={'#9FB0B8'} ink={0.015} seg={10} />
      <Box p={[0, 3.9, 0]} s={[1.5, 1.1, 0.5]} c={'#1C1C1C'} />
      <Glow p={[0, 3.9, 0.27]} color={'#1D3A2E'} intensity={0.4}>
        <planeGeometry args={[1.3, 0.9]} />
      </Glow>
      <Glow p={[0, 3.9, 0.3]} color={'#6FD69A'} intensity={2}>
        <planeGeometry args={[1.1, 0.06]} />
      </Glow>
    </group>
    {/* IV stand */}
    <group position={[-1.4, 0, -4.2]}>
      <Cyl p={[0, 2.6, 0]} r1={0.05} h={5.2} c={'#9FB0B8'} ink={0.012} seg={8} />
      <Box p={[0, 5.0, 0]} s={[0.12, 0.6, 0.3]} c={'#CFE8F5'} ink={0.015} />
      <Cyl p={[0, 0.05, 0]} r1={0.5} h={0.1} c={'#9FB0B8'} ink={0.012} />
    </group>
    {/* privacy curtain on a rail (right) */}
    <Box p={[6.2, 8.3, -1]} s={[0.12, 0.12, 9]} c={'#9FB0B8'} ink={0.012} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Cyl key={i} p={[6.2, 4.5, -4.6 + i * 0.75]} r1={0.38} h={7.6} c={i % 2 ? '#BFE3EA' : '#AFD9E2'} ink={0.015} seg={12} />
    ))}
    <Door p={[1.2, 0, -5.9]} c={C.white} frame={'#9ACFC8'} sign="ROOM 4" />
    <Plant p={[4.2, 0, 6.4]} scale={1.2} pot={C.teal} />
  </group>
);

/* ───────────────────────── 3. PALACE HALL ───────────────────────── */
const Column: React.FC<{p: [number, number, number]}> = ({p}) => (
  <group position={p}>
    <Cyl p={[0, 0.3, 0]} r1={0.9} h={0.6} c={C.tan} ink={0.03} seg={24} />
    <Cyl p={[0, 5.3, 0]} r1={0.6} h={9.4} c={C.cream} ink={0.03} seg={24} />
    <Cyl p={[0, 10.2, 0]} r1={0.95} r2={0.7} h={0.6} c={C.warmYellow} ink={0.03} seg={24} />
  </group>
);

const Banner: React.FC<{p: [number, number, number]}> = ({p}) => (
  <group position={p}>
    <Box p={[0, 0, 0]} s={[1.8, 4.2, 0.08]} c={C.burgundy} ink={0.025} />
    <mesh position={[0, 0.3, 0.06]} material={T(C.warmYellow)}>
      <circleGeometry args={[0.5, 24]} />
    </mesh>
    <Cyl p={[0, 2.2, 0]} r1={0.06} h={2.3} c={C.warmYellow} rot={[0, 0, Math.PI / 2]} ink={0.012} seg={8} />
  </group>
);

const Palace: React.FC = () => (
  <group>
    <Floor kind={{checker: [C.cream, '#D9C7A6']}} repeat={5} />
    <RoomShell wall={'#E9D7B4'} side={'#E9D7B4'} height={18} />
    {/* tall window with sky */}
    <Window p={[0, 8.8, -5.85]} w={3.4} h={5.2} frame={C.cream} rooftops={false} />
    {/* red carpet runner to the throne */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -1]} receiveShadow>
      <planeGeometry args={[3, 26]} />
      <meshToonMaterial color={C.carpet} gradientMap={GRADIENT_SET} />
    </mesh>
    {[-1.55, 1.55].map((x) => (
      <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.07, -1]}>
        <planeGeometry args={[0.15, 26]} />
        <meshToonMaterial color={C.warmYellow} gradientMap={GRADIENT_SET} />
      </mesh>
    ))}
    {/* throne on steps */}
    <group position={[0, 0, -4.6]}>
      <Box p={[0, 0.25, 0]} s={[5, 0.5, 2.4]} c={C.tan} />
      <Box p={[0, 0.75, -0.2]} s={[4, 0.5, 1.8]} c={C.cream} />
      <Box p={[0, 1.9, -0.3]} s={[1.9, 0.5, 1.4]} c={C.warmYellow} />
      <Box p={[0, 1.75, 0.15]} s={[1.6, 0.22, 0.9]} c={C.burgundy} ink={0.02} />
      <Box p={[0, 3.6, -0.9]} s={[2.0, 3.3, 0.35]} c={C.warmYellow} />
      <Box p={[0, 3.5, -0.68]} s={[1.5, 2.6, 0.1]} c={C.burgundy} ink={0.02} />
      <mesh position={[0, 5.55, -0.9]} material={T(C.warmYellow)}>
        <coneGeometry args={[0.35, 0.7, 4]} />
        <Ink w={0.02} />
      </mesh>
    </group>
    <Column p={[-4.2, 0, -3.8]} />
    <Column p={[4.2, 0, -3.8]} />
    <Column p={[-6.8, 0, 1]} />
    <Column p={[6.8, 0, 1]} />
    <Banner p={[-2.6, 7.2, -5.85]} />
    <Banner p={[2.6, 7.2, -5.85]} />
    {/* candle stands (emissive flames) */}
    {[-2.8, 2.8].map((x) => (
      <group key={x} position={[x, 0, -2.6]}>
        <Cyl p={[0, 1.4, 0]} r1={0.08} h={2.8} c={C.warmYellow} ink={0.012} seg={8} />
        <Cyl p={[0, 2.85, 0]} r1={0.35} r2={0.2} h={0.15} c={C.warmYellow} ink={0.015} seg={12} />
        {[-0.2, 0, 0.2].map((dx) => (
          <group key={dx}>
            <Cyl p={[dx, 3.15, 0]} r1={0.07} h={0.45} c={C.cream} ink={0.01} seg={8} />
            <Glow p={[dx, 3.5, 0]} color={'#FFC94A'} intensity={2.4}>
              <sphereGeometry args={[0.08, 8, 8]} />
            </Glow>
          </group>
        ))}
        <pointLight position={[0, 3.6, 0.3]} color={'#FFC98A'} intensity={3} distance={8} decay={1.6} />
      </group>
    ))}
    {/* foreground: a golden urn on a pedestal */}
    <group position={[-4.4, 0, 6.2]}>
      <Box p={[0, 0.9, 0]} s={[1.3, 1.8, 1.3]} c={C.cream} />
      <mesh position={[0, 2.5, 0]} material={T(C.warmYellow)} castShadow>
        <sphereGeometry args={[0.6, 20, 14]} />
        <Ink w={0.03} />
      </mesh>
    </group>
  </group>
);

/* ───────────────────────── 4. RESTAURANT KITCHEN ───────────────────────── */
const Kitchen: React.FC = () => (
  <group>
    <Floor kind={{checker: [C.white, '#2E4A52']}} repeat={6} />
    {/* tiled back wall: teal/white checker */}
    <mesh position={[0, 7, -6]} receiveShadow>
      <planeGeometry args={[40, 14]} />
      <meshToonMaterial map={plasterTex(C.wallCream, [5, 2.5])} gradientMap={GRADIENT_SET} />
    </mesh>
    <mesh position={[0, 3.3, -5.96]}>
      <planeGeometry args={[40, 3.2]} />
      <meshToonMaterial map={checkerTex('#CFE8E4', '#F4F8F6', [40, 3.2])} gradientMap={GRADIENT_SET} />
    </mesh>
    <mesh position={[-9, 7, 4]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[24, 14]} />
      <meshToonMaterial map={plasterTex(C.wallCream, [3, 2])} gradientMap={GRADIENT_SET} />
    </mesh>
    <Window p={[-2.6, 6.6, -5.85]} w={3.0} h={2.4} />
    {/* back counter with stove and pots */}
    <group position={[2.4, 0, -4.9]}>
      <Box p={[0, 1.3, 0]} s={[8, 2.6, 1.8]} c={'#9FB0B8'} />
      <Box p={[0, 2.68, 0]} s={[8.2, 0.16, 2.0]} c={'#D6DDE0'} ink={0.02} />
      {[-1.6, 0.4].map((x) => (
        <Box key={x} p={[x, 1.3, 0.93]} s={[1.6, 1.6, 0.06]} c={'#7F8E96'} ink={0.015} />
      ))}
      {/* burners glowing under a pot */}
      <Glow p={[2.2, 2.79, 0.2]} color={'#FF8A3D'} intensity={2.2} r={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.42, 20]} />
      </Glow>
      <Cyl p={[2.2, 3.25, 0.2]} r1={0.55} r2={0.5} h={0.8} c={'#B9C3C8'} ink={0.025} seg={20} />
      <Cyl p={[-0.6, 3.05, 0.1]} r1={0.45} h={0.55} c={C.burgundy} ink={0.025} seg={20} />
      <Box p={[-2.6, 2.85, 0.2]} s={[1.4, 0.12, 0.9]} c={C.deskWood} ink={0.015} />
    </group>
    {/* pan rail with hanging pans */}
    <Box p={[2.4, 6.0, -5.7]} s={[6, 0.1, 0.1]} c={'#7F8E96'} ink={0.012} />
    {[0.2, 1.5, 2.9, 4.1].map((x, i) => (
      <group key={x} position={[x, 5.2 - (i % 2) * 0.25, -5.6]}>
        <Cyl p={[0, 0, 0]} r1={0.42 + (i % 2) * 0.1} h={0.12} c={'#3A3A3A'} rot={[Math.PI / 2, 0, 0]} ink={0.02} seg={20} />
        <Box p={[0, 0.65, 0]} s={[0.08, 0.9, 0.06]} c={'#3A3A3A'} ink={0} />
      </group>
    ))}
    {/* shelf with jars (left) */}
    <Box p={[-6, 5.2, -5.6]} s={[3.6, 0.15, 0.7]} c={C.deskWood} ink={0.02} />
    {[-7.3, -6.5, -5.7, -4.9].map((x, i) => (
      <Cyl key={x} p={[x, 5.65, -5.5]} r1={0.28} h={0.75} c={[C.warmYellow, C.burgundy, '#6FAA7C', C.earth][i]} ink={0.02} seg={14} />
    ))}
    <Sign p={[-6, 7.2, -5.85]} text="KITCHEN" w={2.6} h={0.8} bg={C.burgundy} fg={C.white} />
    {/* foreground: steel prep table edge with a cutting board */}
    <group position={[-3.6, 0, 6.2]}>
      <Box p={[0, 2.4, 0]} s={[3.6, 0.15, 1.6]} c={'#D6DDE0'} />
      <Box p={[0, 1.2, 0]} s={[3.2, 2.3, 1.3]} c={'#9FB0B8'} ink={0.02} />
      <Box p={[0.3, 2.53, 0]} s={[1.4, 0.1, 0.9]} c={C.tan} ink={0.015} />
    </group>
    <PendantLamp p={[0, 9.4, -2]} />
  </group>
);

/* ───────────────────────── 5. STREET (exterior) ───────────────────────── */
const Building: React.FC<{p: [number, number, number]; w: number; h: number; c: string; trim?: string; awning?: string; sign?: string; seed: number}> = ({
  p,
  w,
  h,
  c,
  trim = C.cream,
  awning,
  sign,
  seed,
}) => {
  const r = mulberry32(seed);
  const cols = Math.max(2, Math.floor(w / 1.6));
  const rows = Math.max(2, Math.floor((h - 4) / 2));
  return (
    <group position={p}>
      <Box p={[0, h / 2, 0]} s={[w, h, 4]} c={c} ink={0.03} />
      <Box p={[0, h + 0.15, 0.1]} s={[w + 0.3, 0.3, 4.3]} c={trim} ink={0.025} />
      {Array.from({length: rows}).map((_, ry) =>
        Array.from({length: cols}).map((__, cx) => {
          const lit = r() < 0.25;
          const x = -w / 2 + (cx + 0.5) * (w / cols);
          const y = 4.6 + ry * 2;
          return (
            <group key={`${ry}-${cx}`} position={[x, y, 2.03]}>
              <Box p={[0, 0, 0]} s={[0.95, 1.25, 0.08]} c={trim} ink={0.015} />
              {lit ? (
                <Glow p={[0, 0, 0.06]} color={'#FFE7A8'} intensity={0.7}>
                  <planeGeometry args={[0.75, 1.05]} />
                </Glow>
              ) : (
                <mesh position={[0, 0, 0.06]} material={T('#9CC7EE')}>
                  <planeGeometry args={[0.75, 1.05]} />
                </mesh>
              )}
            </group>
          );
        }),
      )}
      {/* shop front */}
      <Box p={[0, 1.6, 2.05]} s={[w * 0.7, 2.8, 0.1]} c={'#9CC7EE'} ink={0.02} />
      {awning ? (
        <mesh position={[0, 3.35, 2.5]} rotation={[0.5, 0, 0]} material={T(awning)} castShadow>
          <boxGeometry args={[w * 0.8, 0.08, 1.4]} />
          <Ink w={0.02} />
        </mesh>
      ) : null}
      {sign ? <Sign p={[0, 3.95, 2.12]} text={sign} w={w * 0.55} h={0.6} bg={C.cream} fg={C.burgundy} /> : null}
    </group>
  );
};

const StreetLamp: React.FC<{p: [number, number, number]}> = ({p}) => (
  <group position={p}>
    <Cyl p={[0, 3.3, 0]} r1={0.1} r2={0.14} h={6.6} c={C.navy} ink={0.015} seg={10} />
    <Box p={[0, 6.75, 0]} s={[0.5, 0.55, 0.5]} c={C.navy} ink={0.015} />
    <Glow p={[0, 6.5, 0]} color={'#FFE7A8'} intensity={1.2}>
      <boxGeometry args={[0.36, 0.3, 0.36]} />
    </Glow>
  </group>
);

const Tree: React.FC<{p: [number, number, number]; s?: number; c?: string}> = ({p, s = 1, c = '#4C8A4A'}) => (
  <group position={p} scale={s}>
    <Cyl p={[0, 1.6, 0]} r1={0.22} r2={0.3} h={3.2} c={C.earth} ink={0.025} seg={10} />
    {[
      [0, 4.0, 0, 1.4],
      [-0.8, 3.5, 0.2, 1.0],
      [0.8, 3.6, -0.1, 1.05],
      [0.1, 4.9, 0.1, 0.95],
    ].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} material={T(i % 2 ? '#5C9A57' : c)} castShadow>
        <sphereGeometry args={[r, 16, 12]} />
        <Ink w={0.03} />
      </mesh>
    ))}
  </group>
);

const Street: React.FC = () => (
  <group>
    <SkyBackdrop />
    {/* sidewalk (character zone), curb and road */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 14]} />
      <meshToonMaterial color={'#D8CFC0'} gradientMap={GRADIENT_SET} />
    </mesh>
    {Array.from({length: 16}).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-30 + i * 4, 0.03, 0]}>
        <planeGeometry args={[0.06, 14]} />
        <meshToonMaterial color={'#BDB2A1'} gradientMap={GRADIENT_SET} />
      </mesh>
    ))}
    <Box p={[0, 0.12, 7.1]} s={[80, 0.25, 0.3]} c={'#BDB2A1'} ink={0.02} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 14]} receiveShadow>
      <planeGeometry args={[80, 14]} />
      <meshToonMaterial color={'#5B6470'} gradientMap={GRADIENT_SET} />
    </mesh>
    {/* row of buildings behind the sidewalk */}
    <Building p={[-9.5, 0, -9]} w={6} h={11} c={C.burgundy} awning={C.cream} sign="BAKERY" seed={1} />
    <Building p={[-3.2, 0, -9.3]} w={6.2} h={14} c={'#E8C27A'} awning={C.teal} sign="BOOKS" seed={2} />
    <Building p={[3.2, 0, -9]} w={6.2} h={10} c={C.teal} awning={C.warmYellow} sign="CAFE" seed={3} />
    <Building p={[9.6, 0, -9.4]} w={6.2} h={13} c={'#C7B9A3'} awning={C.burgundy} seed={4} />
    <Building p={[16, 0, -9]} w={6} h={9} c={C.navy} seed={5} />
    {/* far skyline flats */}
    {[-24, -14, -4, 8, 20, 30].map((x, i) => (
      <Box key={x} p={[x, 9 + (i % 3) * 3, -32]} s={[8, 18 + (i % 3) * 6, 1]} c={['#A9B8CC', '#B9C6D6', '#9FB0C5'][i % 3]} ink={0} shadow={false} />
    ))}
    <StreetLamp p={[-4.5, 0, 4.5]} />
    <StreetLamp p={[8, 0, 4.5]} />
    <Tree p={[5.5, 0, -2.5]} s={1.1} />
    {/* bench */}
    <group position={[-6.8, 0, -1.8]}>
      <Box p={[0, 1.1, 0]} s={[3, 0.18, 1]} c={C.deskWood} />
      <Box p={[0, 1.9, -0.45]} s={[3, 0.8, 0.12]} c={C.deskWood} />
      {[-1.3, 1.3].map((x) => (
        <Box key={x} p={[x, 0.55, 0]} s={[0.12, 1.1, 0.9]} c={C.navy} ink={0.015} />
      ))}
    </group>
    {/* foreground: fire hydrant */}
    <group position={[-3.8, 0, 6.0]}>
      <Cyl p={[0, 0.8, 0]} r1={0.38} h={1.6} c={C.red} ink={0.03} seg={16} />
      <mesh position={[0, 1.7, 0]} material={T(C.red)} castShadow>
        <sphereGeometry args={[0.38, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Ink w={0.03} />
      </mesh>
      <Cyl p={[0, 1.05, 0]} r1={0.14} h={1.1} c={C.red} rot={[0, 0, Math.PI / 2]} ink={0.02} seg={10} />
    </group>
  </group>
);

/* ───────────────────────── 6. COUNTRYSIDE (exterior) ───────────────────────── */
const Countryside: React.FC = () => (
  <group>
    <SkyBackdrop />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshToonMaterial color={'#8CC46B'} gradientMap={GRADIENT_SET} />
    </mesh>
    {/* dirt path through the character zone */}
    <mesh rotation={[-Math.PI / 2, 0, 0.25]} position={[0, 0.04, -4]} receiveShadow>
      <planeGeometry args={[3.2, 40]} />
      <meshToonMaterial color={'#D8B48A'} gradientMap={GRADIENT_SET} />
    </mesh>
    {/* rolling hills */}
    {[
      [-30, -55, 26, '#7DB85E'],
      [10, -62, 32, '#73AE58'],
      [42, -50, 24, '#86C066'],
      [-6, -40, 14, '#94CB72'],
    ].map(([x, z, r, c], i) => (
      <mesh key={i} position={[x as number, -(r as number) * 0.62, z as number]} material={T(c as string)} receiveShadow>
        <sphereGeometry args={[r as number, 40, 24]} />
      </mesh>
    ))}
    {/* barn in the distance */}
    <group position={[12, 0, -26]} rotation={[0, -0.4, 0]}>
      <Box p={[0, 3, 0]} s={[8, 6, 6]} c={C.burgundy} ink={0.04} />
      {/* gable roof: a triangular prism (3-sided cylinder lying along z), apex up */}
      <mesh position={[0, 7.38, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 0.6]} material={T('#5B3A2A')} castShadow>
        <cylinderGeometry args={[4.6, 4.6, 6.4, 3]} />
        <Ink w={0.04} />
      </mesh>
      <Box p={[0, 2.2, 3.06]} s={[2.8, 4.2, 0.1]} c={C.cream} ink={0.03} />
    </group>
    <Tree p={[-6.5, 0, -6]} s={1.4} />
    <Tree p={[-11, 0, -14]} s={1.6} />
    <Tree p={[22, 0, -20]} s={1.5} />
    {/* wooden fence */}
    <group position={[0, 0, -3.5]}>
      {Array.from({length: 9}).map((_, i) => (
        <Box key={i} p={[-14 + i * 3.5, 1.1, 0]} s={[0.25, 2.2, 0.25]} c={C.earth} ink={0.02} />
      ))}
      <Box p={[0, 1.6, 0.05]} s={[28.5, 0.2, 0.12]} c={C.tan} ink={0.02} />
      <Box p={[0, 0.9, 0.05]} s={[28.5, 0.2, 0.12]} c={C.tan} ink={0.02} />
    </group>
    {/* foreground: hay bale + flowers */}
    <group position={[-4.2, 0, 6]}>
      <Cyl p={[0, 0.9, 0]} r1={0.95} h={1.8} c={C.warmYellow} rot={[0, 0, Math.PI / 2]} ink={0.03} seg={20} />
    </group>
    {[
      [3.5, 5.5],
      [4.2, 6.4],
      [5.2, 5.8],
    ].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <Cyl p={[0, 0.35, 0]} r1={0.03} h={0.7} c={'#4C8A4A'} ink={0} seg={6} />
        <mesh position={[0, 0.75, 0]} material={T([C.warmYellow, C.white, C.burgundy][i])}>
          <sphereGeometry args={[0.16, 10, 8]} />
          <Ink w={0.012} />
        </mesh>
      </group>
    ))}
  </group>
);

/* ───────────────────────── 7. CLASSROOM / LAB ───────────────────────── */
const Classroom: React.FC = () => {
  const r = mulberry32(17);
  return (
    <group>
      <Floor kind={{wood: '#C79A64'}} repeat={5} />
      <RoomShell wall={C.wallButter} side={C.wallCream} wainscot={C.teal} />
      {/* chalkboard */}
      <group position={[-1.5, 5.4, -5.85]}>
        <Box p={[0, 0, 0]} s={[7.4, 3.6, 0.15]} c={C.deskWood} ink={0.025} />
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[7, 3.2]} />
          <meshToonMaterial map={textTex('E = mc²   ?', '#2F4A3A', '#F2EDE0', 1024, 460)} gradientMap={GRADIENT_SET} />
        </mesh>
        <Box p={[0, -1.9, 0.25]} s={[7, 0.15, 0.4]} c={C.deskWood} ink={0.015} />
      </group>
      <Window p={[5.4, 5.6, -5.85]} w={3.0} />
      {/* lab bench with glowing beakers */}
      <group position={[4.8, 0, -3]}>
        <Box p={[0, 2.4, 0]} s={[4.4, 0.22, 1.8]} c={'#3A3A3A'} />
        <Box p={[0, 1.2, 0]} s={[4.0, 2.3, 1.5]} c={C.white} ink={0.02} />
        {[
          [-1.3, '#6FD69A'],
          [-0.4, '#3CC4C0'],
          [0.6, '#F5C242'],
        ].map(([x, col], i) => (
          <group key={i} position={[x as number, 2.51, 0.1]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.28, 0.32, 0.9, 16, 1, true]} />
              <meshToonMaterial color={'#DDEFF5'} gradientMap={GRADIENT_SET} transparent opacity={0.45} side={THREE.DoubleSide} />
              <Ink w={0.015} />
            </mesh>
            <Glow p={[0, 0.28, 0]} color={col as string} intensity={1.8}>
              <cylinderGeometry args={[0.25, 0.29, 0.5, 16]} />
            </Glow>
          </group>
        ))}
        {/* globe */}
        <group position={[1.6, 2.51, -0.1]}>
          <Cyl p={[0, 0.1, 0]} r1={0.3} h={0.2} c={C.deskWood} ink={0.015} />
          <mesh position={[0, 0.85, 0]} material={T('#3C8FC4')} castShadow>
            <sphereGeometry args={[0.55, 24, 16]} />
            <Ink w={0.02} />
          </mesh>
          <mesh position={[0.12, 1.0, 0.43]} material={T('#6FAA7C')}>
            <sphereGeometry args={[0.2, 10, 8]} />
          </mesh>
        </group>
      </group>
      {/* student desks */}
      {[
        [-5.6, -2.4],
        [-2.6, -2.8],
        [-6.2, 1.2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Box p={[0, 1.95, 0]} s={[2.2, 0.15, 1.3]} c={C.tan} />
          {[-0.95, 0.95].map((dx) => (
            <Box key={dx} p={[dx, 0.95, 0]} s={[0.1, 1.9, 1.1]} c={C.navy} ink={0.015} />
          ))}
          <Box p={[0.3, 2.08, 0.1]} s={[0.7, 0.1, 0.9]} c={[C.burgundy, C.teal, C.warmYellow][Math.floor(r() * 3)]} ink={0.012} />
        </group>
      ))}
      {/* posters */}
      <Sign p={[-7.2, 6.4, -5.85]} text="READ!" w={1.4} h={1.8} bg={C.turquoise} fg={C.white} />
      <Chair p={[-3.8, 0, 6.0]} c={C.teal} rotY={0.6} />
      <PendantLamp p={[0, 9.4, -1]} light={4} />
    </group>
  );
};

/* ───────────────────────── registry ───────────────────────── */
const EXTERIOR = makeAnchors([0, 0, 0], {
  wide: {
    '9x16': {pos: [0, 6, 22], target: [0, 4.5, -2], fov: 44},
    '16x9': {pos: [0, 5.6, 21], target: [0, 4.3, -2], fov: 42},
  },
});

export const SETS: SetDef[] = [
  {id: 'small-room', name: 'Small room', Component: () => <SmallRoom />, anchors: SMALL_ROOM_ANCHORS, light: 'interior', background: C.wallButter, fog: {color: '#F3E2C0', near: 22, far: 60}},
  {id: 'office', name: 'Office', Component: Office, anchors: makeAnchors(), light: 'interior', background: C.wallMint, fog: {color: '#E6EEE6', near: 22, far: 60}},
  {id: 'hospital', name: 'Hospital room', Component: Hospital, anchors: makeAnchors(), light: 'interior', background: C.wallMint, fog: {color: '#E6F2EF', near: 22, far: 60}},
  {id: 'palace', name: 'Palace hall', Component: Palace, anchors: makeAnchors(), light: 'interior', background: '#E9D7B4', fog: {color: '#F0DFC0', near: 24, far: 70}},
  {id: 'kitchen', name: 'Restaurant kitchen', Component: Kitchen, anchors: makeAnchors(), light: 'interior', background: C.wallCream, fog: {color: '#F2E8D5', near: 22, far: 60}},
  {id: 'street', name: 'Street', Component: Street, anchors: EXTERIOR, light: 'day', background: '#BFE0F5', fog: {color: '#CFE6F5', near: 30, far: 110}},
  {id: 'countryside', name: 'Countryside', Component: Countryside, anchors: EXTERIOR, light: 'day', background: '#BFE0F5', fog: {color: '#D6ECF8', near: 30, far: 120}},
  {id: 'classroom', name: 'Classroom / lab', Component: Classroom, anchors: makeAnchors(), light: 'interior', background: C.wallButter, fog: {color: '#F3E2C0', near: 22, far: 60}},
];

export const setById = (id: string) => {
  const s = SETS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown set "${id}". Known: ${SETS.map((x) => x.id).join(', ')}`);
  return s;
};
