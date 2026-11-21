import {Outlines} from '@react-three/drei';
import React from 'react';
import {C} from './palette';

/**
 * Ink outline in WORLD units (scales with the object, like the reference video).
 * Note: in drei 10, `screenspace={true}` is the world-unit mode and the default is pixels.
 */
export const Ink: React.FC<{w?: number; color?: string}> = ({w = 0.04, color = C.outline}) => (
  <Outlines screenspace thickness={w} color={color} />
);
