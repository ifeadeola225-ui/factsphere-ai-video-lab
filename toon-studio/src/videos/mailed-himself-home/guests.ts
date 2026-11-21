import type {Look} from '../../characters/cast';
import {CAST} from '../../characters/cast';

// Guest characters for this story only (original designs; not the reference channel's).
const reg: Look = {
  skin: '#FFEFCD',
  hair: 'spiky',
  hairColor: '#B07A3E', // light brown
  outfit: 'tracksuit',
  top: '#1F7A3A', // Australian green
  topShade: '#17602D',
  accent: '#F5C242', // gold
};

export const GUESTS: Record<string, {look: Look; scale?: number}> = {
  reg: {look: reg},
  'reg-tee': {look: {...reg, outfit: 'tee', top: '#FAF8F2', topShade: '#D8D2C4'}},
  'reg-cargo': {look: {...reg, hat: 'cap', hatColor: '#1E3A6E', hatAccent: '#F5C242', outfit: 'tee', top: '#8A9AA6', topShade: '#6F7F8B'}},
  john: {
    look: {skin: '#F4D2A6', hair: 'buzz', hairColor: '#4A3226', outfit: 'knit', top: '#8A5A3B', topShade: '#6E4428', hat: 'cap', hatColor: '#7D8A4E', hatAccent: '#5E6A3A', facial: 'stubble'},
  },
  thief: {
    look: {skin: '#FFEFCD', hair: 'buzz', hairColor: '#1C1C1C', outfit: 'suit', top: '#3A3F47', topShade: '#2A2E34', accent: '#1C1C1C', accent2: '#5B6470', hat: 'cap', hatColor: '#1C1C1C', hatAccent: '#3A3F47', facial: 'mustache'},
  },
  worker1: {look: {skin: '#B8743F', hair: 'buzz', hairColor: '#1C1C1C', outfit: 'tee', top: '#FAF8F2', topShade: '#D8D2C4', hat: 'cap', hatColor: '#F5C242', hatAccent: '#8E2F3C', facial: 'mustache'}},
  worker2: {look: {skin: '#7E4E2B', hair: 'buzz', hairColor: '#1C1C1C', outfit: 'tee', top: '#3CC4C0', topShade: '#2E9C99', hat: 'cap', hatColor: '#FAF8F2', hatAccent: '#1F8A8A'}},
  daughter: {look: {skin: '#FFEFCD', hair: 'bun', hairColor: '#B07A3E', outfit: 'dress', top: '#F5C242', topShade: '#D9A12A', accent: '#DB1F23', accent2: '#FAF8F2'}, scale: 0.62},
  bramble: {look: CAST.bramble.look},
  odd: {look: CAST.odd.look},
};
