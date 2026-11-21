import React from 'react';
import * as THREE from 'three';
import {Ink} from '../engine/Ink';
import {toonMat} from '../engine/toon';
import type {Look} from './cast';
import {BODY} from './body';

// Clothing details. Rendered INSIDE the torso's z-scale (0.85) group, so curved patches
// (open cylinder segments just outside the torso radius) hug the bean-shaped torso.
// Every patch sits ≥ 0.02 outside the surface beneath it (no coplanar faces: LOCKED rule).

const R = BODY.torsoR;
const TY = BODY.torsoY;

/** Curved patch on the front of the torso. arc in radians, centered on the front (+z). */
const Patch: React.FC<{y: number; h: number; arc: number; color: string; lift?: number; rTop?: number; ink?: number; yaw?: number}> = ({
  y,
  h,
  arc,
  color,
  lift = 0.025,
  rTop,
  ink = 0.02,
  yaw = 0,
}) => (
  <mesh position={[0, y, 0]} rotation={[0, yaw, 0]} material={toonMat(color, 'char')}>
    <cylinderGeometry args={[rTop ?? R + lift, R + lift, h, 32, 1, true, Math.PI - arc / 2 + Math.PI, arc]} />
    <Ink w={ink} />
  </mesh>
);
// Note: CylinderGeometry theta 0 points to +z after the default orientation offset used above
// (thetaStart = 2π − arc/2 centers the patch on the front).

/** Flat V (triangle, point down) on the upper chest, just outside the torso. */
const VNeck: React.FC<{color: string; w?: number; h?: number; y?: number}> = ({color, w = 0.46, h = 0.5, y = TY + 0.72}) => {
  const shape = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(0, -h);
    s.closePath();
    return s;
  }, [w, h]);
  return (
    <mesh position={[0, y, R + 0.035]} rotation={[-0.12, 0, 0]} material={toonMat(color, 'char')}>
      <shapeGeometry args={[shape]} />
      <Ink w={0.015} />
    </mesh>
  );
};

const Buttons: React.FC<{ys: number[]; color: string; z?: number}> = ({ys, color, z = R + 0.04}) => (
  <>
    {ys.map((y) => (
      <mesh key={y} position={[0, y, z]} material={toonMat(color, 'char')}>
        <sphereGeometry args={[0.045, 10, 8]} />
      </mesh>
    ))}
  </>
);

const NeckRing: React.FC<{color: string; tube?: number; r?: number}> = ({color, tube = 0.12, r = 0.48}) => (
  <mesh position={[0, TY + 1.0, -0.06]} rotation={[Math.PI / 2 + 0.22, 0, 0]} material={toonMat(color, 'char')} castShadow>
    <torusGeometry args={[r, tube, 12, 32]} />
    <Ink w={0.028} />
  </mesh>
);

/** Flared skirt / robe hem: a cone from the waist down. */
const Skirt: React.FC<{color: string; bottom: number; rBottom: number; trim?: string}> = ({color, bottom, rBottom, trim}) => {
  const top = TY - 0.3;
  const h = top - bottom;
  return (
    <>
      <mesh position={[0, bottom + h / 2, 0]} material={toonMat(color, 'char')} castShadow>
        <cylinderGeometry args={[R + 0.02, rBottom, h, 32, 1, true]} />
        <Ink w={0.035} />
      </mesh>
      {/* inside of the hem, so the open bottom never shows a see-through hole */}
      <mesh position={[0, bottom + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toonMat('#3A1F14', 'char')}>
        <circleGeometry args={[rBottom - 0.02, 32]} />
      </mesh>
      {trim ? (
        <mesh position={[0, bottom + 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={toonMat(trim, 'char')}>
          <torusGeometry args={[rBottom - 0.04, 0.06, 8, 40]} />
        </mesh>
      ) : null}
    </>
  );
};

export const OutfitDetails: React.FC<{look: Look}> = ({look}) => {
  const shade = look.topShade ?? look.top;
  const accent = look.accent ?? '#F5C242';
  const accent2 = look.accent2 ?? '#FAF8F2';
  switch (look.outfit) {
    case 'hoodie':
      return (
        <>
          <NeckRing color={shade} tube={0.15} r={0.5} />
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.17, TY + 0.62, Math.sqrt(R * R - 0.17 * 0.17) + 0.035]}>
              <mesh position={[0, -0.25, 0]} material={toonMat(accent, 'char')}>
                <capsuleGeometry args={[0.032, 0.5, 4, 8]} />
              </mesh>
              <mesh position={[0, -0.55, 0.01]} material={toonMat(accent, 'char')}>
                <sphereGeometry args={[0.06, 10, 8]} />
                <Ink w={0.015} />
              </mesh>
            </group>
          ))}
          <Patch y={TY - 0.45} h={0.5} arc={1.24} color={shade} />
        </>
      );
    case 'suit':
      return (
        <>
          {/* shirt V and tie (narrow at the bottom: rTop wider) */}
          <Patch y={TY + 0.55} h={0.55} arc={0.62} color={accent2} lift={0.025} />
          <mesh position={[0, TY + 0.45, R + 0.06]} rotation={[0.08, 0, 0]} material={toonMat(accent, 'char')}>
            <boxGeometry args={[0.13, 0.62, 0.04]} />
            <Ink w={0.015} />
          </mesh>
          {/* lapels */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.24, TY + 0.5, R - 0.02]} rotation={[0.1, s * 0.35, s * -0.35]} material={toonMat(shade, 'char')}>
              <boxGeometry args={[0.16, 0.7, 0.06]} />
              <Ink w={0.015} />
            </mesh>
          ))}
          <Buttons ys={[TY - 0.05, TY - 0.35]} color={accent} />
          <NeckRing color={shade} tube={0.08} r={0.5} />
        </>
      );
    case 'labcoat':
      return (
        <>
          <VNeck color={accent2} w={0.5} h={0.55} />
          {/* teal collar wings */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.3, TY + 0.78, R - 0.08]} rotation={[0.35, s * 0.4, s * -0.6]} material={toonMat(accent, 'char')}>
              <boxGeometry args={[0.32, 0.36, 0.06]} />
              <Ink w={0.018} />
            </mesh>
          ))}
          {/* coat opening line and pocket with a pen */}
          <mesh position={[0, TY - 0.2, R + 0.03]} material={toonMat('#B9B9B2', 'char')}>
            <boxGeometry args={[0.03, 1.1, 0.02]} />
          </mesh>
          <Patch y={TY + 0.05} h={0.32} arc={0.42} color={shade} yaw={0.55} lift={0.03} />
          <mesh position={[0.36, TY + 0.3, R - 0.0]} rotation={[0, 0.5, 0]} material={toonMat('#1E3A6E', 'char')}>
            <capsuleGeometry args={[0.025, 0.22, 4, 6]} />
          </mesh>
          <Buttons ys={[TY - 0.1, TY - 0.45]} color={'#B9B9B2'} />
        </>
      );
    case 'sweater':
      return (
        <>
          {/* V-neck shows a white collar */}
          <VNeck color={accent} />
          <NeckRing color={shade} tube={0.08} r={0.5} />
          {/* ribbed hem */}
          <Patch y={TY - 0.62} h={0.16} arc={Math.PI * 2} color={shade} lift={0.02} />
        </>
      );
    case 'knit':
      return (
        <>
          <NeckRing color={shade} tube={0.11} r={0.5} />
          {[0.2, -0.15, -0.5].map((dy) => (
            <Patch key={dy} y={TY + dy} h={0.07} arc={Math.PI * 2} color={shade} lift={0.02} ink={0} />
          ))}
        </>
      );
    case 'robe':
      return (
        <>
          <NeckRing color={accent} tube={0.1} r={0.5} />
          {/* front trim stripe and a sash */}
          <Patch y={TY + 0.1} h={1.3} arc={0.3} color={accent} lift={0.03} />
          <Patch y={TY - 0.3} h={0.14} arc={Math.PI * 2} color={look.accent2 ?? '#DB1F23'} lift={0.045} />
          <Skirt color={look.top} bottom={0.18} rBottom={1.25} trim={accent} />
        </>
      );
    case 'dress':
      return (
        <>
          <NeckRing color={accent2} tube={0.07} r={0.48} />
          <Patch y={TY - 0.3} h={0.12} arc={Math.PI * 2} color={accent} lift={0.04} />
          <Skirt color={look.top} bottom={0.65} rBottom={1.15} />
        </>
      );
    case 'tee':
      return <NeckRing color={shade} tube={0.07} r={0.48} />;
  }
};

/** Torso shell mesh (the garment itself). Exported so Character keeps one source of truth. */
export const torsoGeometry = new THREE.CapsuleGeometry(BODY.torsoR, BODY.torsoLen, 10, 32);
