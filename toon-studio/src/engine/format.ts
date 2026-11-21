import {useVideoConfig} from 'remotion';

export type Format = '9x16' | '16x9';
export const useFormat = (): Format => {
  const {width, height} = useVideoConfig();
  return height > width ? '9x16' : '16x9';
};

export const SIZES: Record<Format, {width: number; height: number}> = {
  '9x16': {width: 1080, height: 1920},
  '16x9': {width: 1920, height: 1080},
};
