import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {cameraAt, type Anchor} from '../engine/camera';
import {Fx} from '../engine/fx';
import {C} from '../engine/palette';
import {Stage} from '../engine/Stage';
import {SmallRoom} from '../sets/SmallRoom';

// QC view of a set with no DOF, so every surface is sharp and z-fighting is visible.
export const SetCheck: React.FC<{anchor: Anchor}> = ({anchor}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const cam = cameraAt(anchor, 'drift-right', frame, fps, durationInFrames / fps, {amount: 0.1});
  return (
    <AbsoluteFill>
      <Stage cam={cam} light="interior" background={C.wallButter}>
        <SmallRoom />
        <Fx bloom={0.6} vignette={0.2} />
      </Stage>
    </AbsoluteFill>
  );
};
