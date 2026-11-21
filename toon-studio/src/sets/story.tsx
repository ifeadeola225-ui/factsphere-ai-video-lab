import React from 'react';
import {C} from '../engine/palette';
import {mulberry32} from '../engine/rng';
import {plasterTex, skyTex, woodTex} from '../engine/textures';
import {GRADIENT_SET} from '../engine/toon';
import {Airliner, Crate, LuggageCart, PalmTree, Parcel} from '../props/story';
import {Box, Cyl, Glow, Sign, SkyBackdrop, Window, makeAnchors, type Anchors} from './kit';

// Story sets for "He Mailed Himself Home" (reusable: airfield, warehouse, road).
// Character zone = origin. No coplanar faces (LOCKED rule).

/* ───────── AIRFIELD ───────── variants: day-london | fog | hot-bombay */
export type AirVariant = 'day-london' | 'fog' | 'hot-bombay';

export const Airfield: React.FC<{variant: AirVariant; plane?: boolean; cart?: boolean}> = ({variant, plane = true, cart = true}) => {
  const hot = variant === 'hot-bombay';
  const sky = hot ? (['#F7B267', '#FCE3B4'] as const) : variant === 'fog' ? (['#C9D3DC', '#E6ECF0'] as const) : (['#9FB8CC', '#DCE6EE'] as const);
  return (
    <group>
      <SkyBackdrop top={sky[0]} bottom={sky[1]} />
      {/* tarmac apron + taxi line, grass beyond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]} receiveShadow>
        <planeGeometry args={[140, 60]} />
        <meshToonMaterial color={hot ? '#8C7B6A' : '#6B7178'} gradientMap={GRADIENT_SET} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -6]}>
        <planeGeometry args={[140, 0.35]} />
        <meshToonMaterial color={C.warmYellow} gradientMap={GRADIENT_SET} />
      </mesh>
      {Array.from({length: 14}).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-40 + i * 6, 0.03, 4]}>
          <planeGeometry args={[3, 0.25]} />
          <meshToonMaterial color={C.white} gradientMap={GRADIENT_SET} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -60]} receiveShadow>
        <planeGeometry args={[200, 60]} />
        <meshToonMaterial color={hot ? '#C9A45C' : '#7DA85E'} gradientMap={GRADIENT_SET} />
      </mesh>
      {/* control tower + hangar in the distance */}
      <group position={[-22, 0, -30]}>
        <Box p={[0, 6, 0]} s={[3, 12, 3]} c={hot ? C.cream : '#D8D2C4'} ink={0.04} />
        <Box p={[0, 13, 0]} s={[5, 2.4, 5]} c={'#2A3A55'} ink={0.04} />
        <Box p={[0, 14.4, 0]} s={[5.6, 0.4, 5.6]} c={C.white} ink={0.03} />
      </group>
      <group position={[-48, 0, -40]}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={undefined}>
          <cylinderGeometry args={[9, 9, 16, 24, 1, false, -Math.PI / 2, Math.PI]} />
          <meshToonMaterial color={hot ? '#D8B48A' : '#9FB0B8'} gradientMap={GRADIENT_SET} />
        </mesh>
        <Box p={[0, 3.5, 8.1]} s={[10, 7, 0.2]} c={'#4A5568'} ink={0.04} />
      </group>
      {/* real scale: Reg ≈ 1.8 m tall = 6.3 units, so a 1960s jet (fuselage ≈ 3.8 m) is scaled ×3 */}
      {plane ? <Airliner position={[16, 0, -60]} rotation={[0, -0.35, 0]} scale={3} /> : null}
      {hot ? (
        <>
          <PalmTree position={[-12, 0, -10]} s={1.1} />
          <PalmTree position={[-17, 0, -16]} s={1.3} />
          <PalmTree position={[15, 0, -12]} s={1.2} />
          <Sign p={[-7, 4.2, -7]} text="BOMBAY" w={3.4} h={1.0} bg={C.cream} fg={C.burgundy} />
          <Cyl p={[-8.4, 1.8, -7.1]} r1={0.1} h={3.6} c={C.deskWood} ink={0.015} seg={8} />
          <Cyl p={[-5.6, 1.8, -7.1]} r1={0.1} h={3.6} c={C.deskWood} ink={0.015} seg={8} />
          {/* low hot sun */}
          <Glow p={[-30, 20, -66]} color={'#FFE08A'} intensity={2.5}>
            <circleGeometry args={[5, 32]} />
          </Glow>
        </>
      ) : (
        <Sign p={[-7, 4.2, -7]} text="LONDON" w={3.4} h={1.0} bg={C.cream} fg={C.navy} />
      )}
      {!hot ? (
        <>
          <Cyl p={[-8.4, 1.8, -7.1]} r1={0.1} h={3.6} c={C.deskWood} ink={0.015} seg={8} />
          <Cyl p={[-5.6, 1.8, -7.1]} r1={0.1} h={3.6} c={C.deskWood} ink={0.015} seg={8} />
        </>
      ) : null}
      {cart ? <LuggageCart position={[6.5, 0, -2]} rotation={[0, -0.3, 0]} /> : null}
    </group>
  );
};

export const AIRFIELD_ANCHORS: Anchors = makeAnchors([0, 0, 0], {
  wide: {
    '9x16': {pos: [2, 6.5, 24], target: [0, 4.5, -4], fov: 46},
    '16x9': {pos: [2, 6, 24], target: [0, 4.5, -4], fov: 42},
  },
  low_fg: {
    '9x16': {pos: [-1.5, 1.2, 12], target: [0.5, 4.8, -2], fov: 40},
    '16x9': {pos: [-2, 1.4, 13], target: [1, 4.5, -2], fov: 36},
  },
});

/* ───────── CARGO WAREHOUSE ───────── variants: london | perth-night | london-flashback */
export type WhVariant = 'london' | 'perth-night' | 'london-flashback';

const Shelving: React.FC<{position: [number, number, number]; seed: number}> = ({position, seed}) => {
  const r = mulberry32(seed);
  return (
    <group position={position}>
      {[0, 2.2, 4.4].map((y) => (
        <Box key={y} p={[0, y + 0.1, 0]} s={[5, 0.15, 1.6]} c={'#4A6FA5'} ink={0.02} />
      ))}
      {[-2.4, 2.4].map((x) => (
        <Box key={x} p={[x, 3.3, 0]} s={[0.15, 6.6, 1.6]} c={'#4A6FA5'} ink={0.02} />
      ))}
      {[0, 2.2, 4.4].flatMap((y) =>
        [-1.6, 0, 1.6].map((x) => <Parcel key={`${x}-${y}`} position={[x + (r() - 0.5) * 0.3, y + 0.55, 0]} s={0.9 + r() * 0.5} rotation={[0, (r() - 0.5) * 0.4, 0]} />),
      )}
    </group>
  );
};

export const Warehouse: React.FC<{variant: WhVariant}> = ({variant}) => {
  const night = variant === 'perth-night';
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshToonMaterial map={woodTex(night ? '#5E6B78' : '#9C8F80', [6, 6], 4)} gradientMap={GRADIENT_SET} />
      </mesh>
      {/* corrugated back wall + big roller door with a window strip */}
      <mesh position={[0, 7, -7]} receiveShadow>
        <planeGeometry args={[50, 14]} />
        <meshToonMaterial map={plasterTex(night ? '#5B6B85' : '#B9C6D0', [6, 2])} gradientMap={GRADIENT_SET} />
      </mesh>
      {Array.from({length: 18}).map((_, i) => (
        <Box key={i} p={[-17 + i * 2, 7, -6.93]} s={[0.12, 14, 0.06]} c={night ? '#4A5873' : '#A3B1BC'} ink={0} shadow={false} />
      ))}
      <Box p={[-4, 3.2, -6.85]} s={[6.4, 6.4, 0.12]} c={night ? '#3E4A60' : '#8C9AA6'} ink={0.03} />
      {Array.from({length: 7}).map((_, i) => (
        <Box key={i} p={[-4, 0.6 + i * 0.85, -6.74]} s={[6.2, 0.06, 0.06]} c={night ? '#2E384A' : '#75838F'} ink={0} shadow={false} />
      ))}
      <Window p={[5.5, 7.6, -6.85]} w={6} h={1.4} night={night} rooftops={false} />
      {/* side wall */}
      <mesh position={[-11, 7, 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 14]} />
        <meshToonMaterial map={plasterTex(night ? '#56647C' : '#C3CDD5', [3, 2])} gradientMap={GRADIENT_SET} />
      </mesh>
      <Shelving position={[-7.5, 0, -5.4]} seed={5} />
      <Shelving position={[7.8, 0, -5.4]} seed={9} />
      {/* parcel stacks and a pallet */}
      <Box p={[4.6, 0.12, -1.8]} s={[2.4, 0.24, 2.0]} c={C.tan} ink={0.02} />
      <Parcel position={[4.3, 0.6, -1.8]} s={1.2} />
      <Parcel position={[5.0, 1.45, -1.7]} s={1.0} rotation={[0, 0.3, 0]} />
      <Parcel position={[-5.8, 0.4, 1.5]} s={1.1} rotation={[0, -0.2, 0]} />
      {variant === 'perth-night' ? (
        <>
          <Sign p={[3.6, 5.4, -6.8]} text="PERTH · AIR CARGO" w={4.2} h={0.8} bg={C.cream} fg={C.navy} />
          {/* moonlight shaft through the window */}
          <mesh position={[4.5, 4.4, -2.5]} rotation={[0.55, 0, 0]}>
            <boxGeometry args={[5, 8, 0.02]} />
            <meshBasicMaterial color={'#BFD3FF'} transparent opacity={0.08} depthWrite={false} />
          </mesh>
        </>
      ) : (
        <Sign p={[3.6, 5.4, -6.8]} text="AIR CARGO · LONDON" w={4.2} h={0.8} bg={C.warmYellow} fg={C.navy} />
      )}
      {/* hanging work lights */}
      {[-3, 4].map((x) => (
        <group key={x} position={[x, 10.5, -2]}>
          <Cyl p={[0, 1, 0]} r1={0.03} h={2} c={'#160502'} ink={0} />
          <Cyl p={[0, 0, 0]} r1={0.3} r2={0.75} h={0.5} c={'#4A5568'} ink={0.02} />
          <Glow p={[0, -0.2, 0]} color={night ? '#CFE0FF' : '#FFE7A8'} intensity={night ? 1.0 : 1.8}>
            <sphereGeometry args={[0.2, 12, 10]} />
          </Glow>
          <pointLight position={[0, -0.6, 0]} color={night ? '#CFE0FF' : '#FFE0B0'} intensity={night ? 2.5 : 5} distance={14} decay={1.4} />
        </group>
      ))}
    </group>
  );
};

export const WAREHOUSE_ANCHORS: Anchors = makeAnchors([0, 0, 0], {
  high: {
    '9x16': {pos: [0, 12, 9], target: [0, 2.6, 0], fov: 38},
    '16x9': {pos: [0, 11.5, 10], target: [0, 2.6, 0], fov: 36},
  },
});

/** Inside the crate: tight wooden box lit by the torch, no outside view. */
export const CrateInterior: React.FC = () => (
  <group>
    {[
      {p: [0, 3.2, -1.6], r: [0, 0, 0]},
      {p: [-1.9, 3.2, 0], r: [0, Math.PI / 2, 0]},
      {p: [1.9, 3.2, 0], r: [0, -Math.PI / 2, 0]},
      {p: [0, 6.6, 0], r: [Math.PI / 2, 0, 0]},
      {p: [0, -0.01, 0], r: [-Math.PI / 2, 0, 0]},
    ].map((w, i) => (
      <mesh key={i} position={w.p as [number, number, number]} rotation={w.r as [number, number, number]} receiveShadow>
        <planeGeometry args={[6, 7]} />
        <meshToonMaterial map={woodTex('#A9783F', [1.5, 1.5], 6)} gradientMap={GRADIENT_SET} side={2} />
      </mesh>
    ))}
  </group>
);

export const CRATE_INTERIOR_ANCHORS: Anchors = makeAnchors([0, 0, 0], {
  close: {
    '9x16': {pos: [0.3, 4.4, 6.2], target: [0, 3.4, 0], fov: 44},
    '16x9': {pos: [0.4, 4.2, 6.2], target: [0, 3.4, 0], fov: 40},
  },
});

/** Outback road: red earth, long straight road, scrub, big sky, ADELAIDE sign. */
export const OutbackRoad: React.FC = () => {
  const r = mulberry32(31);
  return (
    <group>
      <SkyBackdrop top={'#5FA8E0'} bottom={'#F3E2C0'} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshToonMaterial color={'#C8693A'} gradientMap={GRADIENT_SET} />
      </mesh>
      {/* road runs away from camera, to the right of the character */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.03, -40]} receiveShadow>
        <planeGeometry args={[16, 160]} />
        <meshToonMaterial color={'#4A4A4A'} gradientMap={GRADIENT_SET} />
      </mesh>
      {Array.from({length: 20}).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.06, 14 - i * 9]}>
          <planeGeometry args={[0.4, 4.5]} />
          <meshToonMaterial color={C.white} gradientMap={GRADIENT_SET} />
        </mesh>
      ))}
      {/* scrub bushes */}
      {Array.from({length: 18}).map((_, i) => {
        const x = (r() - 0.5) * 60;
        const z = -6 - r() * 50;
        if (Math.abs(x - 10) < 10) return null;
        return (
          <mesh key={i} position={[x, 0.4, z]} material={undefined} castShadow scale={[1.4, 0.7, 1.2]}>
            <sphereGeometry args={[0.8 + r() * 0.6, 12, 8]} />
            <meshToonMaterial color={i % 2 ? '#7D8A4E' : '#93A05C'} gradientMap={GRADIENT_SET} />
          </mesh>
        );
      })}
      {/* distant mesa */}
      <mesh position={[-30, 4, -80]} receiveShadow>
        <cylinderGeometry args={[14, 18, 8, 7]} />
        <meshToonMaterial color={'#B05A35'} gradientMap={GRADIENT_SET} />
      </mesh>
      {/* road sign */}
      {/* road sign at real size (~2 m board on a ~2.5 m post), on the verge beside Reg */}
      <group position={[-6.5, 0, -5]} rotation={[0, 0.3, 0]}>
        <Cyl p={[-2.4, 4.0, 0]} r1={0.15} h={8.0} c={'#9FB0B8'} ink={0.02} seg={8} />
        <Cyl p={[2.4, 4.0, 0]} r1={0.15} h={8.0} c={'#9FB0B8'} ink={0.02} seg={8} />
        <Sign p={[0, 7.4, 0.2]} text="ADELAIDE 2,700 km" w={6.4} h={1.6} bg={'#1F7A3A'} fg={C.white} />
      </group>
    </group>
  );
};

export const ROAD_ANCHORS: Anchors = makeAnchors([0, 0, 0], {
  wide: {
    '9x16': {pos: [1.5, 5.8, 24], target: [3.2, 4.4, -3], fov: 46},
    '16x9': {pos: [-1, 5.2, 19], target: [1.5, 4, -3], fov: 40},
  },
});

export const skyFor = (variant: AirVariant) => (variant === 'hot-bombay' ? '#F7C68A' : variant === 'fog' ? '#D9E1E6' : '#C3D3DF');
export {skyTex};
