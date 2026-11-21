import React from 'react';
import {Ink} from '../engine/Ink';
import {toonMat} from '../engine/toon';
import type {Look} from './cast';
import {onHead} from './Face';

// Hats and glasses. Head-local space (head radius 1, face toward +z).

export const HatMesh: React.FC<{look: Look}> = ({look}) => {
  if (!look.hat) return null;
  const c = toonMat(look.hatColor ?? '#1C1C1C', 'char');
  const a = toonMat(look.hatAccent ?? '#FAF8F2', 'char');
  switch (look.hat) {
    case 'beanie':
      return (
        <group rotation={[-0.3, 0, 0]}>
          <mesh material={c} castShadow>
            <sphereGeometry args={[1.09, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
            <Ink w={0.035} />
          </mesh>
          <mesh material={c} position={[0, Math.cos(Math.PI * 0.42) * 1.09, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[Math.sin(Math.PI * 0.42) * 1.09, 0.12, 10, 40]} />
            <Ink w={0.03} />
          </mesh>
          <mesh material={a} position={[0, 1.18, 0]} castShadow>
            <sphereGeometry args={[0.24, 16, 12]} />
            <Ink w={0.03} />
          </mesh>
        </group>
      );
    case 'bowler':
      return (
        <group position={[0, 0.66, -0.05]} rotation={[-0.18, 0, 0.06]}>
          <mesh material={c} castShadow scale={[1, 0.85, 1]}>
            <sphereGeometry args={[0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Ink w={0.035} />
          </mesh>
          <mesh material={a} position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.81, 0.81, 0.16, 32, 1, true]} />
          </mesh>
          <mesh material={c} position={[0, 0.0, 0]} castShadow>
            <cylinderGeometry args={[1.22, 1.22, 0.06, 40]} />
            <Ink w={0.03} />
          </mesh>
        </group>
      );
    case 'crown':
      return (
        <group position={[0, 0.8, -0.05]} rotation={[-0.15, 0, 0]}>
          <mesh material={c} castShadow>
            <cylinderGeometry args={[0.72, 0.64, 0.38, 32, 1, true]} />
            <Ink w={0.03} />
          </mesh>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const t = (i / 7) * Math.PI * 2;
            return (
              <mesh key={i} material={c} position={[Math.sin(t) * 0.7, 0.33, Math.cos(t) * 0.7]} castShadow>
                <coneGeometry args={[0.11, 0.3, 8]} />
                <Ink w={0.02} />
              </mesh>
            );
          })}
          <mesh material={a} position={[0, 0.02, 0.69]}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <Ink w={0.015} />
          </mesh>
        </group>
      );
    case 'cap':
      return (
        <group position={[0, 0.62, 0]} rotation={[-0.2, 0, 0]}>
          <mesh material={c} castShadow>
            <cylinderGeometry args={[0.85, 0.95, 0.4, 32]} />
            <Ink w={0.03} />
          </mesh>
          <mesh material={c} position={[0, -0.12, 0.95]} rotation={[0.25, 0, 0]} castShadow>
            <boxGeometry args={[1.1, 0.06, 0.5]} />
            <Ink w={0.025} />
          </mesh>
          <mesh material={a} position={[0, 0.02, 0.0]}>
            <cylinderGeometry args={[0.97, 0.97, 0.1, 32, 1, true]} />
          </mesh>
        </group>
      );
    case 'chef':
      return (
        <group position={[0, 0.7, -0.05]} rotation={[-0.15, 0, 0]}>
          <mesh material={c} castShadow>
            <cylinderGeometry args={[0.8, 0.8, 0.5, 32]} />
            <Ink w={0.03} />
          </mesh>
          {[-0.35, 0, 0.35].map((x, i) => (
            <mesh key={i} material={c} position={[x, 0.55, 0]} castShadow>
              <sphereGeometry args={[0.5, 18, 12]} />
              <Ink w={0.03} />
            </mesh>
          ))}
        </group>
      );
    case 'straw':
      return (
        <group position={[0, 0.6, -0.05]} rotation={[-0.2, 0, 0]}>
          <mesh material={c} castShadow>
            <cylinderGeometry args={[0.7, 0.85, 0.5, 32]} />
            <Ink w={0.03} />
          </mesh>
          <mesh material={a} position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.87, 0.87, 0.14, 32, 1, true]} />
          </mesh>
          <mesh material={c} position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[1.6, 1.6, 0.05, 40]} />
            <Ink w={0.03} />
          </mesh>
        </group>
      );
  }
};

/** Round glasses: two rings on the face around the eyes, plus a bridge. */
export const Glasses: React.FC<{look: Look}> = ({look}) => {
  if (!look.glasses) return null;
  const ink = toonMat('#160502', 'char');
  return (
    <>
      {[-1, 1].map((s) => {
        const p = onHead(s * 0.26, 0.07, 1, 0.05);
        return (
          <group key={s} position={p.position} rotation={p.rotation}>
            <mesh material={ink}>
              <torusGeometry args={[0.2, 0.032, 8, 28]} />
            </mesh>
          </group>
        );
      })}
      {(() => {
        const p = onHead(0, 0.1, 1, 0.05);
        return (
          <group position={p.position} rotation={p.rotation}>
            <mesh material={ink} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.025, 0.1, 4, 6]} />
            </mesh>
          </group>
        );
      })()}
      {/* temple arms toward the ears */}
      {[-1, 1].map((s) => (
        <mesh key={`t${s}`} material={ink} position={[s * 0.62, 0.1, 0.78]} rotation={[0, s * 0.9, Math.PI / 2]}>
          <capsuleGeometry args={[0.02, 0.4, 4, 6]} />
        </mesh>
      ))}
    </>
  );
};
