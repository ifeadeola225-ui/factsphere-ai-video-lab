import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect} from 'react';
import {useVideoConfig} from 'remotion';
import * as THREE from 'three';
import type {CameraState} from './camera';

export type LightPreset = 'interior' | 'day' | 'night' | 'lantern' | 'overcast' | 'hot' | 'fog' | 'nightInterior';

/** Sets the R3F camera from a frame-driven CameraState before each render. */
const CameraRig: React.FC<{cam: CameraState}> = ({cam}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...cam.pos);
    camera.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0);
    camera.lookAt(...cam.target);
    camera.fov = cam.fov;
    camera.near = 0.1;
    camera.far = 400;
    camera.updateProjectionMatrix();
  });
  return null;
};

const KEY = {
  interior: {color: '#FFE6C4', intensity: 2.2, pos: [6, 10, 6]},
  day: {color: '#FFF1D6', intensity: 2.8, pos: [8, 14, 6]},
  night: {color: '#B9C8FF', intensity: 0.9, pos: [-6, 12, 4]},
  lantern: {color: '#FFC98A', intensity: 1.2, pos: [4, 8, 5]},
  overcast: {color: '#E6ECF2', intensity: 1.3, pos: [4, 14, 8]},
  hot: {color: '#FFD9A0', intensity: 3.4, pos: [10, 16, 4]},
  fog: {color: '#E8EEF2', intensity: 0.9, pos: [2, 14, 6]},
  nightInterior: {color: '#FFC98A', intensity: 1.0, pos: [5, 8, 6]},
} as const;

const HEMI = {
  interior: {sky: '#FFF4E2', ground: '#B79A7A', intensity: 1.3},
  day: {sky: '#CFE6FF', ground: '#C9AE84', intensity: 1.5},
  night: {sky: '#6A7FBC', ground: '#2E2A48', intensity: 1.0},
  lantern: {sky: '#7A6A5A', ground: '#3A2418', intensity: 0.9},
  overcast: {sky: '#C9D3DC', ground: '#8C8478', intensity: 1.5},
  hot: {sky: '#FFE3B0', ground: '#C98A4A', intensity: 1.4},
  fog: {sky: '#DDE5EA', ground: '#A9AFB2', intensity: 1.7},
  nightInterior: {sky: '#5A6FA8', ground: '#3A2A28', intensity: 0.85},
} as const;

/** A3.3 lighting rig, softened per the brief (lighter shadows, stronger fill). */
export const Lights: React.FC<{preset: LightPreset; shadowSize?: number; keyPos?: [number, number, number]}> = ({preset, shadowSize = 12, keyPos}) => {
  const k = KEY[preset];
  const h = HEMI[preset];
  return (
    <>
      <hemisphereLight args={[h.sky, h.ground, h.intensity]} />
      <directionalLight
        color={k.color}
        intensity={k.intensity}
        position={keyPos ?? (k.pos as unknown as [number, number, number])}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-left={-shadowSize}
        shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize}
        shadow-camera-bottom={-shadowSize}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
      />
      {/* weak cool rim from behind */}
      <directionalLight color="#CFE3FF" intensity={0.5} position={[-4, 6, -8]} />
    </>
  );
};

export type StageProps = {
  cam: CameraState;
  light?: LightPreset;
  background?: string;
  fog?: {color: string; near: number; far: number};
  /** Frame-driven key light position (e.g. a sun sweeping across the sky). */
  keyPos?: [number, number, number];
  children: React.ReactNode;
};

/** A2.2: ThreeCanvas sized from useVideoConfig, with lights, shadows and the camera rig. */
export const Stage: React.FC<StageProps> = ({cam, light = 'interior', background = '#EFE6D2', fog, keyPos, children}) => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows="soft"
      flat // no tone mapping, so palette hexes render true
      gl={{antialias: true, preserveDrawingBuffer: true}}
      camera={{fov: cam.fov, position: cam.pos}}
    >
      <color attach="background" args={[background]} />
      {fog ? <fog attach="fog" args={[fog.color, fog.near, fog.far]} /> : null}
      <CameraRig cam={cam} />
      <Lights preset={light} keyPos={keyPos} />
      {children}
    </ThreeCanvas>
  );
};
