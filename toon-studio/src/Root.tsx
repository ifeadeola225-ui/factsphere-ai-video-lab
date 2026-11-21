import React from 'react';
import {Composition} from 'remotion';
import {SIZES} from './engine/format';
import {Smoke} from './tests/Smoke';
import {StyleTest} from './tests/StyleTest';
import {SetCheck} from './tests/SetCheck';
import {CastSheet, PANELS} from './tests/CastSheet';
import {CAST_IDS} from './characters/cast';
import {MotionReel} from './tests/MotionReel';
import {SetsSheet} from './tests/SetsSheet';
import {SETS} from './sets/library';

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Smoke9x16" component={Smoke} durationInFrames={3 * FPS} fps={FPS} {...SIZES['9x16']} />
    <Composition id="Smoke16x9" component={Smoke} durationInFrames={3 * FPS} fps={FPS} {...SIZES['16x9']} />
    <Composition id="StyleTest9x16" component={StyleTest} durationInFrames={4 * FPS} fps={FPS} {...SIZES['9x16']} />
    <Composition id="StyleTest16x9" component={StyleTest} durationInFrames={4 * FPS} fps={FPS} {...SIZES['16x9']} />
    <Composition id="SetCheckShelf" component={SetCheck} defaultProps={{anchor: {pos: [-1.5, 3.2, 3.5], target: [-4.2, 2.3, -5.4], fov: 40}}} durationInFrames={2 * FPS} fps={FPS} width={1280} height={720} />
    <Composition id="CastSheet" component={CastSheet} durationInFrames={CAST_IDS.length * PANELS} fps={FPS} width={600} height={900} />
    <Composition id="MotionReel16x9" component={MotionReel} durationInFrames={12 * FPS} fps={FPS} {...SIZES['16x9']} />
    <Composition id="SetsSheet9x16" component={SetsSheet} durationInFrames={SETS.length} fps={FPS} {...SIZES['9x16']} />
    <Composition id="SetsSheet16x9" component={SetsSheet} durationInFrames={SETS.length} fps={FPS} {...SIZES['16x9']} />
  </>
);
