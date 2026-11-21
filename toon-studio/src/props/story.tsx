import React from 'react';
import * as THREE from 'three';
import type {Vec3} from '../engine/camera';
import {Ink} from '../engine/Ink';
import {C} from '../engine/palette';
import {mulberry32} from '../engine/rng';
import {textTex, woodTex} from '../engine/textures';
import {GRADIENT_SET, toonMat} from '../engine/toon';
import {Box, Cyl, Glow} from '../sets/kit';

// Props for "He Mailed Himself Home" (and reusable later). Primitives only, chunky, outlined (A6).
// Rule: no coplanar faces; decals sit ≥ 0.03 off their surface.

const T = (c: string) => toonMat(c);
const plankMat = () =>
  new THREE.MeshToonMaterial({map: woodTex('#C89B62', [1, 1], 5), gradientMap: GRADIENT_SET});
let _plank: THREE.MeshToonMaterial | null = null;
const PLANK = () => (_plank ??= plankMat());

/* ───────── CRATE ─────────
   Body units: W 3.4 (x) × H 4.2 (y) × D 2.8 (z). Origin at the bottom centre.
   lid: 0 = closed, 1 = fully open (hinged at the back top edge).
   front: 0 = in place, 1 = front panel fallen flat (break-out). */
export const CRATE = {W: 3.4, H: 4.2, D: 2.8, wall: 0.14} as const;

const Decal: React.FC<{text: string; w: number; h: number; p: Vec3; r?: Vec3; bg?: string; fg?: string}> = ({text, w, h, p, r, bg = '#E9D2A6', fg = '#8E2F3C'}) => (
  <mesh position={p} rotation={r}>
    <planeGeometry args={[w, h]} />
    <meshToonMaterial map={textTex(text, bg, fg, 1024, Math.round((1024 * h) / w))} gradientMap={GRADIENT_SET} transparent={false} />
  </mesh>
);

export const Crate: React.FC<{
  position?: Vec3;
  rotation?: Vec3;
  lid?: number;
  front?: number;
  label?: boolean;
  thisWayUp?: boolean;
  scale?: number;
}> = ({position = [0, 0, 0], rotation, lid = 0, front = 0, label = true, thisWayUp = true, scale = 1}) => {
  const {W, H, D, wall} = CRATE;
  const m = PLANK();
  const slat = (key: string, p: Vec3, s: Vec3) => (
    <mesh key={key} position={p} material={T('#A9783F')} castShadow>
      <boxGeometry args={s} />
      <Ink w={0.02} />
    </mesh>
  );
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* bottom */}
      <mesh position={[0, wall / 2, 0]} material={m} castShadow receiveShadow>
        <boxGeometry args={[W, wall, D]} />
        <Ink w={0.03} />
      </mesh>
      {/* back + sides */}
      <mesh position={[0, H / 2, -D / 2 + wall / 2]} material={m} castShadow receiveShadow>
        <boxGeometry args={[W, H, wall]} />
        <Ink w={0.03} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 - wall / 2), H / 2, 0]} material={m} castShadow receiveShadow>
          <boxGeometry args={[wall, H, D - 2 * wall - 0.002]} />
          <Ink w={0.03} />
        </mesh>
      ))}
      {/* front panel: hinged at the bottom edge so it can fall open */}
      <group position={[0, wall, D / 2 - wall / 2]} rotation={[front * (Math.PI / 2), 0, 0]}>
        <mesh position={[0, (H - wall) / 2, 0]} material={m} castShadow receiveShadow>
          <boxGeometry args={[W - 2 * wall - 0.004, H - wall, wall]} />
          <Ink w={0.03} />
        </mesh>
        {/* cross slats on the front */}
        {slat('fs1', [0, 0.35, wall / 2 + 0.05], [W - 0.3, 0.28, 0.1])}
        {slat('fs2', [0, H - wall - 0.35, wall / 2 + 0.05], [W - 0.3, 0.28, 0.1])}
        {label ? (
          <>
            <Decal text="CASH ON DELIVERY" w={2.5} h={0.62} p={[0, (H - wall) / 2 + 0.55, wall / 2 + 0.035]} />
            <Decal text="SUPREME SHOES · PERTH" w={2.2} h={0.36} p={[0, (H - wall) / 2 - 0.2, wall / 2 + 0.035]} bg="#E9D2A6" fg="#1E3A6E" />
          </>
        ) : null}
      </group>
      {/* side stencil */}
      {thisWayUp ? (
        <group position={[W / 2 + 0.035, H / 2 + 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Decal text="↑ THIS WAY UP ↑" w={2.2} h={0.5} p={[0, 0, 0]} bg="#C89B62" fg="#160502" />
        </group>
      ) : null}
      {/* lid hinged at the back top edge */}
      <group position={[0, H, -D / 2]} rotation={[-lid * 1.9, 0, 0]}>
        <mesh position={[0, wall / 2, D / 2]} material={m} castShadow>
          <boxGeometry args={[W + 0.1, wall, D + 0.1]} />
          <Ink w={0.03} />
        </mesh>
        {slat('ls', [0, wall + 0.05, D / 2], [0.3, 0.1, D])}
      </group>
    </group>
  );
};

/* ───────── AIRLINER (1960s jet, generic livery, no real branding) ─────────
   Nose points +x. Origin at the ground under the fuselage centre. Length ≈ 34. */
export const Airliner: React.FC<{position?: Vec3; rotation?: Vec3; scale?: number}> = ({position = [0, 0, 0], rotation, scale = 1}) => {
  const body = T('#F4F1EA');
  const stripe = T(C.teal);
  const r = 1.9;
  const y = 3.4;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* fuselage */}
      <mesh position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} material={body} castShadow>
        <capsuleGeometry args={[r, 26, 12, 32]} />
        <Ink w={0.06} />
      </mesh>
      {/* cheatline stripe + window row (sit outside the fuselage surface) */}
      <mesh position={[0, y + 0.15, 0]} rotation={[0, 0, Math.PI / 2]} material={stripe}>
        <cylinderGeometry args={[r + 0.03, r + 0.03, 25, 32, 1, true, Math.PI * 0.42, Math.PI * 0.16]} />
      </mesh>
      <mesh position={[0, y + 0.15, 0]} rotation={[0, 0, Math.PI / 2]} material={stripe}>
        <cylinderGeometry args={[r + 0.03, r + 0.03, 25, 32, 1, true, Math.PI * 1.42, Math.PI * 0.16]} />
      </mesh>
      {Array.from({length: 18}).map((_, i) => (
        <mesh key={i} position={[-10 + i * 1.15, y + 0.75, r - 0.12]} material={T('#2A3A55')}>
          <boxGeometry args={[0.35, 0.45, 0.3]} />
        </mesh>
      ))}
      {/* cockpit windows */}
      <mesh position={[14.2, y + 0.9, 0]} rotation={[0, 0, -0.5]} material={T('#2A3A55')}>
        <boxGeometry args={[0.9, 0.35, 2.2]} />
      </mesh>
      {/* swept wings */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.5, y - 0.9, s * 1.2]} rotation={[0, s * 0.55, 0]}>
          <mesh position={[-1.5, 0, s * 7]} material={body} castShadow>
            <boxGeometry args={[4.2, 0.35, 14]} />
            <Ink w={0.05} />
          </mesh>
          {/* engine pods */}
          {[4, 9].map((d) => (
            <group key={d} position={[0.6, -1.0, s * d]}>
              <mesh rotation={[0, 0, Math.PI / 2]} material={T('#C9CED6')} castShadow>
                <cylinderGeometry args={[0.55, 0.6, 3.2, 20]} />
                <Ink w={0.04} />
              </mesh>
              <mesh position={[1.62, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={T('#3A3A3A')}>
                <circleGeometry args={[0.45, 20]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {/* tail fin + stabilisers */}
      <mesh position={[-12.6, y + 3.6, 0]} rotation={[0, 0, 0.55]} material={stripe} castShadow>
        <boxGeometry args={[4.5, 5.5, 0.35]} />
        <Ink w={0.05} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-13, y + 0.6, s * 3]} rotation={[0, s * 0.45, 0]} material={body} castShadow>
          <boxGeometry args={[2.6, 0.25, 5]} />
          <Ink w={0.04} />
        </mesh>
      ))}
      {/* landing gear */}
      {[
        [11, 0],
        [-1, -2.6],
        [-1, 2.6],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Cyl p={[0, 0.9, 0]} r1={0.12} h={1.8} c={'#9FB0B8'} ink={0.015} seg={8} />
          <Cyl p={[0, 0.45, 0]} r1={0.45} h={0.4} c={'#1C1C1C'} rot={[Math.PI / 2, 0, 0]} ink={0.02} seg={16} />
        </group>
      ))}
    </group>
  );
};

export const LuggageCart: React.FC<{position?: Vec3; rotation?: Vec3}> = ({position = [0, 0, 0], rotation}) => (
  <group position={position} rotation={rotation}>
    <Box p={[0, 0.75, 0]} s={[4.4, 0.2, 3.2]} c={'#4A5568'} />
    <Box p={[-2.1, 1.6, 0]} s={[0.12, 1.7, 3.2]} c={'#4A5568'} ink={0.015} />
    {[
      [-1.7, -1.3],
      [1.7, -1.3],
      [-1.7, 1.3],
      [1.7, 1.3],
    ].map(([x, z], i) => (
      <Cyl key={i} p={[x, 0.35, z]} r1={0.34} h={0.25} c={'#1C1C1C'} rot={[Math.PI / 2, 0, 0]} ink={0.02} seg={14} />
    ))}
    <Box p={[2.8, 0.9, 0]} s={[1.4, 0.1, 0.1]} c={'#4A5568'} ink={0.012} />
  </group>
);

/* Hand-held props: origin at the grip, extend downward along -y (hand local space points -y along the arm). */
export const Javelin: React.FC<{tilt?: number; fwd?: number}> = ({tilt = 0, fwd = 0}) => (
  <group rotation={[0, 0, tilt]} position={[0, 0, fwd]}>
    <Cyl p={[0, 1.3, 0]} r1={0.05} h={6.2} c={C.tan} ink={0.018} seg={8} />
    <mesh position={[0, 4.65, 0]} material={T('#9FB0B8')}>
      <coneGeometry args={[0.07, 0.6, 8]} />
      <Ink w={0.015} />
    </mesh>
    <Cyl p={[0, 0, 0]} r1={0.08} h={0.5} c={C.navy} ink={0.012} seg={8} />
  </group>
);

export const Wallet: React.FC = () => (
  <group position={[0, -0.12, 0.08]}>
    <Box p={[0, 0, 0]} s={[0.42, 0.32, 0.1]} c={'#6E4428'} ink={0.015} />
    <Box p={[0.05, 0.12, 0.02]} s={[0.25, 0.1, 0.09]} c={'#7FAA6A'} ink={0} />
  </group>
);

export const Hammer: React.FC = () => (
  <group>
    <Cyl p={[0, -0.25, 0.1]} r1={0.05} h={0.9} c={C.deskWood} rot={[0.3, 0, 0]} ink={0.012} seg={8} />
    <Box p={[0, -0.68, 0.24]} s={[0.18, 0.18, 0.5]} c={'#5B6470'} ink={0.015} />
  </group>
);

export const PhotoCard: React.FC = () => (
  <group position={[0, -0.18, 0.12]} rotation={[-0.2, 0, 0]}>
    <Box p={[0, 0, 0]} s={[0.55, 0.42, 0.03]} c={C.white} ink={0.012} />
    <mesh position={[0, 0.03, 0.02]} material={T('#F6E3A1')}>
      <planeGeometry args={[0.45, 0.28]} />
    </mesh>
    <mesh position={[0, 0.06, 0.03]} material={T('#FFEFCD')}>
      <circleGeometry args={[0.07, 16]} />
    </mesh>
    <mesh position={[0, -0.04, 0.03]} material={T(C.yellowDress)}>
      <circleGeometry args={[0.06, 3]} />
    </mesh>
  </group>
);

export const Calendar: React.FC<{position: Vec3; circled?: boolean}> = ({position, circled = true}) => (
  <group position={position}>
    <Box p={[0, 0, 0]} s={[1.4, 1.7, 0.06]} c={C.white} ink={0.02} />
    <mesh position={[0, 0.6, 0.05]} material={T(C.burgundy)}>
      <planeGeometry args={[1.3, 0.35]} />
    </mesh>
    {Array.from({length: 20}).map((_, i) => (
      <mesh key={i} position={[-0.5 + (i % 5) * 0.25, 0.25 - Math.floor(i / 5) * 0.26, 0.05]} material={T('#D8D2C4')}>
        <planeGeometry args={[0.18, 0.18]} />
      </mesh>
    ))}
    {circled ? (
      <mesh position={[0.25, -0.27, 0.07]} material={T(C.red)}>
        <torusGeometry args={[0.15, 0.025, 6, 20]} />
      </mesh>
    ) : null}
  </group>
);

/** Frame-driven rain streaks (A2.1/A2.5: seeded positions, motion from `frame`). */
export const Rain: React.FC<{frame: number; count?: number; area?: [number, number, number]; center?: Vec3; speed?: number}> = ({
  frame,
  count = 160,
  area = [30, 16, 18],
  center = [0, 0, 2],
  speed = 0.55,
}) => {
  const r = mulberry32(77);
  const drops = Array.from({length: count}).map(() => [r() - 0.5, r(), r() - 0.5, 0.6 + r() * 0.6] as const);
  const mat = React.useMemo(() => new THREE.MeshBasicMaterial({color: '#DCE6F0', transparent: true, opacity: 0.55}), []);
  return (
    <group>
      {drops.map(([x, y0, z, len], i) => {
        const y = ((((y0 * area[1] - frame * speed) % area[1]) + area[1]) % area[1]);
        return (
          <mesh key={i} position={[center[0] + x * area[0], center[1] + y, center[2] + z * area[2]]} material={mat}>
            <boxGeometry args={[0.025, len, 0.025]} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Tin: React.FC<{position: Vec3; c?: string; s?: number}> = ({position, c = C.red, s = 1}) => (
  <group position={position} scale={s}>
    <Cyl p={[0, 0.25, 0]} r1={0.22} h={0.5} c={'#C9CED6'} ink={0.015} seg={16} />
    <Cyl p={[0, 0.25, 0]} r1={0.235} h={0.28} c={c} ink={0} seg={16} />
  </group>
);

export const WaterBottle: React.FC<{position: Vec3; s?: number}> = ({position, s = 1}) => (
  <group position={position} scale={s}>
    <Cyl p={[0, 0.4, 0]} r1={0.2} h={0.8} c={'#9CD3F0'} ink={0.015} seg={16} />
    <Cyl p={[0, 0.88, 0]} r1={0.09} h={0.16} c={C.navy} ink={0.01} seg={10} />
  </group>
);

export const EmptyBottle: React.FC<{position: Vec3; s?: number}> = ({position, s = 1}) => (
  <group position={position} scale={s}>
    <mesh position={[0, 0.45, 0]}>
      <cylinderGeometry args={[0.2, 0.22, 0.9, 16, 1, true]} />
      <meshToonMaterial color={'#CFE8E4'} gradientMap={GRADIENT_SET} transparent opacity={0.55} side={THREE.DoubleSide} />
      <Ink w={0.015} />
    </mesh>
    <Cyl p={[0, 0.98, 0]} r1={0.08} h={0.2} c={'#CFE8E4'} ink={0.012} seg={10} />
  </group>
);

export const Torch: React.FC<{position: Vec3; rotation?: Vec3; on?: number}> = ({position, rotation, on = 1}) => (
  <group position={position} rotation={rotation}>
    <Cyl p={[0, 0, 0]} r1={0.12} h={0.7} c={'#C0392B'} rot={[0, 0, Math.PI / 2]} ink={0.015} seg={12} />
    <Cyl p={[0.42, 0, 0]} r1={0.18} r2={0.12} h={0.2} c={'#C9CED6'} rot={[0, 0, Math.PI / 2]} ink={0.015} seg={12} />
    {on > 0.01 ? (
      <>
        <Glow p={[0.53, 0, 0]} color={'#FFF1B8'} intensity={2.5 * on} r={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.14, 16]} />
        </Glow>
        <pointLight position={[0.9, 0, 0]} color={'#FFE7A8'} intensity={5 * on} distance={6} decay={1.5} />
      </>
    ) : null}
  </group>
);

export const RubberStamp: React.FC<{position: Vec3}> = ({position}) => (
  <group position={position}>
    <Cyl p={[0, 0.5, 0]} r1={0.12} h={0.7} c={C.deskWood} ink={0.015} seg={10} />
    <mesh position={[0, 0.95, 0]} material={T(C.deskWood)}>
      <sphereGeometry args={[0.2, 12, 10]} />
      <Ink w={0.015} />
    </mesh>
    <Box p={[0, 0.1, 0]} s={[0.6, 0.2, 0.4]} c={C.burgundy} ink={0.015} />
  </group>
);

export const Phone: React.FC<{position: Vec3; rotation?: Vec3}> = ({position, rotation}) => (
  <group position={position} rotation={rotation}>
    <Box p={[0, 0.25, 0]} s={[1.0, 0.5, 0.8]} c={C.burgundy} />
    <Cyl p={[0, 0.52, 0]} r1={0.22} h={0.06} c={'#E8E2D2'} ink={0.012} seg={16} />
    <group position={[0, 0.68, 0]}>
      <Box p={[0, 0, 0]} s={[1.1, 0.18, 0.25]} c={C.burgundy} ink={0.015} />
      {[-1, 1].map((s) => (
        <Box key={s} p={[s * 0.5, -0.12, 0]} s={[0.25, 0.14, 0.3]} c={C.burgundy} ink={0.012} />
      ))}
    </group>
  </group>
);

export const WallClock: React.FC<{position: Vec3; frame: number; fps: number; speed?: number}> = ({position, frame, fps, speed = 1}) => {
  const minute = (frame / fps) * speed * Math.PI * 2 * 0.2;
  return (
    <group position={position}>
      <Cyl p={[0, 0, 0.05]} r1={0.6} h={0.1} c={C.white} rot={[Math.PI / 2, 0, 0]} ink={0.03} seg={32} />
      <group position={[0, 0, 0.13]} rotation={[0, 0, -minute]}>
        <Box p={[0, 0.22, 0]} s={[0.05, 0.44, 0.02]} c={'#160502'} ink={0} shadow={false} />
      </group>
      <group position={[0, 0, 0.15]} rotation={[0, 0, -minute / 12 - 1]}>
        <Box p={[0, 0.14, 0]} s={[0.06, 0.28, 0.02]} c={'#160502'} ink={0} shadow={false} />
      </group>
    </group>
  );
};

export const Parcel: React.FC<{position?: Vec3; s?: number; tag?: boolean; rotation?: Vec3}> = ({position = [0, 0, 0], s = 1, tag = false, rotation}) => (
  <group position={position} scale={s} rotation={rotation}>
    <Box p={[0, 0, 0]} s={[1.0, 0.7, 0.8]} c={'#C89B62'} />
    <Box p={[0, 0, 0]} s={[1.02, 0.12, 0.82]} c={'#E9D2A6'} ink={0} />
    {tag ? <Decal text="C.O.D." w={0.5} h={0.25} p={[0.15, 0.1, 0.44]} bg={C.white} fg={C.burgundy} /> : null}
  </group>
);

export const Invoice: React.FC<{length?: number}> = ({length = 0.7}) => (
  <group position={[0, -0.15, 0.15]} rotation={[-0.25, 0, 0]}>
    <mesh position={[0, -length / 2 + 0.2, 0]}>
      <planeGeometry args={[0.6, length]} />
      <meshToonMaterial color={C.white} gradientMap={GRADIENT_SET} side={THREE.DoubleSide} />
      <Ink w={0.01} />
    </mesh>
    <mesh position={[0, 0.06, 0.012]}>
      <planeGeometry args={[0.5, 0.18]} />
      <meshBasicMaterial map={textTex('BILL', C.white, C.burgundy)} toneMapped={false} />
    </mesh>
    {Array.from({length: Math.max(2, Math.floor(length / 0.16))}).map((_, i) => (
      <mesh key={i} position={[-0.05, -0.1 - i * 0.16, 0.012]}>
        <planeGeometry args={[0.38, 0.03]} />
        <meshBasicMaterial color={'#9FB0B8'} toneMapped={false} />
      </mesh>
    ))}
  </group>
);

export const Pocketknife: React.FC<{position: Vec3; rotation?: Vec3}> = ({position, rotation}) => (
  <group position={position} rotation={rotation}>
    <Box p={[0, 0, 0]} s={[0.5, 0.12, 0.08]} c={C.red} ink={0.012} />
    <mesh position={[0.45, 0.02, 0]} material={T('#C9CED6')}>
      <boxGeometry args={[0.45, 0.08, 0.02]} />
      <Ink w={0.01} />
    </mesh>
  </group>
);

export const Cake: React.FC<{position: Vec3}> = ({position}) => (
  <group position={position}>
    <Cyl p={[0, 0.3, 0]} r1={0.75} h={0.6} c={C.white} ink={0.025} seg={24} />
    <Cyl p={[0, 0.62, 0]} r1={0.77} h={0.06} c={'#F3D6CC'} ink={0} seg={24} />
    {[-0.35, 0, 0.35].map((x) => (
      <group key={x} position={[x, 0.65, 0]}>
        <Cyl p={[0, 0.2, 0]} r1={0.04} h={0.4} c={C.turquoise} ink={0.008} seg={8} />
        <Glow p={[0, 0.46, 0]} color={'#FFC94A'} intensity={2.4}>
          <sphereGeometry args={[0.06, 8, 8]} />
        </Glow>
      </group>
    ))}
    <pointLight position={[0, 1.4, 0.4]} color={'#FFC98A'} intensity={2.5} distance={5} decay={1.6} />
  </group>
);

export const Balloon: React.FC<{position: Vec3; c: string; frame: number; seed: number}> = ({position, c, frame, seed}) => {
  const bob = Math.sin(frame / 18 + seed) * 0.12;
  return (
    <group position={[position[0], position[1] + bob, position[2]]}>
      <mesh material={T(c)} castShadow scale={[1, 1.2, 1]}>
        <sphereGeometry args={[0.55, 20, 14]} />
        <Ink w={0.025} />
      </mesh>
      <Cyl p={[0, -1.4, 0]} r1={0.012} h={2.0} c={'#160502'} ink={0} seg={4} />
    </group>
  );
};

export const Bunting: React.FC<{y: number; z: number; w?: number}> = ({y, z, w = 14}) => {
  const n = 14;
  const cols = [C.red, C.warmYellow, C.teal, C.white, C.turquoise];
  return (
    <group position={[0, y, z]}>
      <Box p={[0, 0, 0]} s={[w, 0.03, 0.03]} c={'#160502'} ink={0} shadow={false} />
      {Array.from({length: n}).map((_, i) => (
        <mesh key={i} position={[-w / 2 + (i + 0.5) * (w / n), -0.3 - Math.sin((i / (n - 1)) * Math.PI) * 0.0, 0.02]} rotation={[0, 0, Math.PI]} material={T(cols[i % cols.length])}>
          <circleGeometry args={[0.35, 3]} />
        </mesh>
      ))}
    </group>
  );
};

export const PalmTree: React.FC<{position: Vec3; s?: number}> = ({position, s = 1}) => (
  <group position={position} scale={s}>
    {[0, 1, 2, 3, 4].map((i) => (
      <Cyl key={i} p={[i * 0.12, 0.9 + i * 1.6, 0]} r1={0.3 - i * 0.03} r2={0.34 - i * 0.03} h={1.6} c={C.earth} rot={[0, 0, -0.07]} ink={0.02} seg={10} />
    ))}
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2;
      return (
        <group key={i} position={[0.6, 8.6, 0]} rotation={[0, a, 0]}>
          <mesh position={[1.4, -0.4, 0]} rotation={[0, 0, -0.45]} material={T(i % 2 ? '#4C8A4A' : '#5C9A57')} castShadow scale={[1, 0.18, 0.55]}>
            <sphereGeometry args={[1.6, 14, 8]} />
            <Ink w={0.025} />
          </mesh>
        </group>
      );
    })}
  </group>
);
