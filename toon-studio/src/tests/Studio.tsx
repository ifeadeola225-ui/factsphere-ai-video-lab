import React from 'react';
import {C} from '../engine/palette';
import {GRADIENT_SET} from '../engine/toon';

/** Neutral photo-studio backdrop for sheets (floor + curved sweep). */
export const Studio: React.FC<{color?: string}> = ({color = C.wallCream}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshToonMaterial color={color} gradientMap={GRADIENT_SET} />
    </mesh>
    <mesh position={[0, 0, -8]} rotation={[0, 0, 0]} receiveShadow>
      <cylinderGeometry args={[8, 8, 30, 32, 1, true, Math.PI * 0.5, Math.PI]} />
      <meshToonMaterial color={color} gradientMap={GRADIENT_SET} side={2} />
    </mesh>
  </group>
);
