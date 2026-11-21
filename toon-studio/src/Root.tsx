import React from 'react';
import {Composition} from 'remotion';
import {SIZES} from './engine/format';
import {Smoke} from './tests/Smoke';
import {StyleTest} from './tests/StyleTest';

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Smoke9x16" component={Smoke} durationInFrames={3 * FPS} fps={FPS} {...SIZES['9x16']} />
    <Composition id="Smoke16x9" component={Smoke} durationInFrames={3 * FPS} fps={FPS} {...SIZES['16x9']} />
    <Composition id="StyleTest9x16" component={StyleTest} durationInFrames={4 * FPS} fps={FPS} {...SIZES['9x16']} />
    <Composition id="StyleTest16x9" component={StyleTest} durationInFrames={4 * FPS} fps={FPS} {...SIZES['16x9']} />
  </>
);
