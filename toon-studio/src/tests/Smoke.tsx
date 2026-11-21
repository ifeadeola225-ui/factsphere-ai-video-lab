import {Ink} from '../engine/Ink';
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {cameraAt, type Anchor} from '../engine/camera';
import {useFormat} from '../engine/format';
import {Fx} from '../engine/fx';
import {C} from '../engine/palette';
import {Stage} from '../engine/Stage';
import {plasterTex, woodTex} from '../engine/textures';
import {OUTLINE_RATIO, toonMat} from '../engine/toon';

// STATE 1 smoke test: outlined toon sphere on a textured floor, camera push-in, DOF.
const ANCHORS: Record<'9x16' | '16x9', Anchor> = {
  '9x16': {pos: [0, 2.2, 11], target: [0, 1.4, 0], fov: 34},
  '16x9': {pos: [0, 2.0, 9], target: [0, 1.2, 0], fov: 32},
};

export const Smoke: React.FC<{fx?: boolean; parts?: {dof?: boolean; bloom?: boolean; vignette?: boolean}; msaa?: number; hdr?: boolean}> = ({fx = true, parts, msaa, hdr}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const fmt = useFormat();
  const cam = cameraAt(ANCHORS[fmt], 'push-in', frame, fps, durationInFrames / fps, {amount: 0.12});
  const R = 1;
  return (
    <Stage cam={cam} light="interior" background={C.wallCream} fog={{color: C.wallCream, near: 10, far: 30}}>
      {/* hero sphere */}
      <mesh position={[0, R + 0.02, 0]} castShadow material={toonMat(C.headCream, 'char')}>
        <sphereGeometry args={[R, 64, 48]} />
        <Ink w={OUTLINE_RATIO * R} />
      </mesh>
      {/* background spheres to show depth of field */}
      <mesh position={[-2.6, 0.6, -5]} castShadow material={toonMat(C.teal, 'char')}>
        <sphereGeometry args={[0.6, 48, 32]} />
        <Ink w={0.03} />
      </mesh>
      <mesh position={[2.4, 0.8, -8]} castShadow material={toonMat(C.warmYellow, 'char')}>
        <sphereGeometry args={[0.8, 48, 32]} />
        <Ink w={0.03} />
      </mesh>
      {/* emissive lamp to test bloom */}
      <mesh position={[3.2, 2.6, -6]}>
        <sphereGeometry args={[0.25, 24, 16]} />
        <meshBasicMaterial color={'#FFE7A8'} toneMapped={false} />
      </mesh>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshToonMaterial map={woodTex(C.floorWood, [6, 6])} gradientMap={toonMat(C.floorWood).gradientMap} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 6, -12]} receiveShadow>
        <planeGeometry args={[40, 12]} />
        <meshToonMaterial map={plasterTex(C.wallMint, [4, 1.5])} gradientMap={toonMat(C.wallMint).gradientMap} />
      </mesh>
      {fx ? <Fx focus={[0, R, 0]} bokehScale={3.5} parts={parts} {...(msaa !== undefined ? {msaa} : {})} {...(hdr !== undefined ? {hdr} : {})} /> : null}
    </Stage>
  );
};
