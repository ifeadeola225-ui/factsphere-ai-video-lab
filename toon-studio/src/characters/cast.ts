// Recurring cast for Oddly Human (proposed in STATE 3). Every look is original: same style as the
// reference video, but none of its characters' designs (brief section 0.7).

export type HairStyle = 'none' | 'swoop' | 'spiky' | 'buzz' | 'tufts' | 'bun' | 'long';
export type Outfit = 'hoodie' | 'suit' | 'labcoat' | 'sweater' | 'knit' | 'robe' | 'dress' | 'tee';
export type Hat = 'beanie' | 'bowler' | 'crown' | 'cap' | 'chef' | 'straw';

export type Look = {
  skin: string;
  hair: HairStyle;
  hairColor: string;
  outfit: Outfit;
  top: string; // main garment color
  topShade?: string; // pocket / trim / lapels
  accent?: string; // cords, tie, collar, sash
  accent2?: string; // shirt / buttons / gems
  hat?: Hat;
  hatColor?: string;
  hatAccent?: string;
  glasses?: 'round';
  facial?: 'mustache' | 'stubble' | 'beard';
};

export type CastMember = {name: string; role: string; personality: string; look: Look};

export const CAST = {
  odd: {
    name: 'ODD',
    role: 'Narrator, mascot, and "you" in What If episodes',
    personality: 'Curious and deadpan; tries everything once, reacts with one raised brow.',
    look: {
      skin: '#FFEFCD',
      hair: 'swoop',
      hairColor: '#3B2418',
      outfit: 'hoodie',
      top: '#1F8A8A',
      topShade: '#176B6B',
      accent: '#F5C242',
    },
  },
  drwren: {
    name: 'Dr. Wren',
    role: 'The expert: scientist, doctor, inventor',
    personality: 'Over-explains everything, delighted by weird facts, forgets to blink.',
    look: {
      skin: '#B8743F',
      hair: 'tufts',
      hairColor: '#C9CED6',
      outfit: 'labcoat',
      top: '#F7F7F4',
      topShade: '#DCDCD6',
      accent: '#1F8A8A',
      accent2: '#8EC9EE',
      glasses: 'round',
    },
  },
  bramble: {
    name: 'Mr. Bramble',
    role: 'The boss: banker, emperor\'s advisor, rich skeptic',
    personality: 'Pompous and money-obsessed; laughs at every idea right before it works.',
    look: {
      skin: '#FFEFCD',
      hair: 'buzz',
      hairColor: '#1C1C1C',
      outfit: 'suit',
      top: '#8E2F3C',
      topShade: '#6B1F2A',
      accent: '#F5C242',
      accent2: '#FAF8F2',
      hat: 'bowler',
      hatColor: '#1C1C1C',
      hatAccent: '#8E2F3C',
      facial: 'mustache',
    },
  },
  mae: {
    name: 'Mae',
    role: 'The friend and skeptic',
    personality: 'Practical, quick-witted; says "that\'s crazy" and is usually wrong about it.',
    look: {
      skin: '#D9A06B',
      hair: 'bun',
      hairColor: '#4A3226',
      outfit: 'sweater',
      top: '#F5C242',
      topShade: '#D9A12A',
      accent: '#FAF8F2',
      glasses: 'round',
    },
  },
  gus: {
    name: 'Gus',
    role: 'The worker: builder, cook, sailor, guard',
    personality: 'Tired, kind, has seen everything twice; one-line reactions.',
    look: {
      skin: '#FFEFCD',
      hair: 'spiky',
      hairColor: '#8C4A1B',
      outfit: 'knit',
      top: '#B6ADE6',
      topShade: '#958BCF',
      hat: 'beanie',
      hatColor: '#6FAA7C',
      hatAccent: '#FAF8F2',
      facial: 'stubble',
    },
  },
  ruler: {
    name: 'The Ruler',
    role: 'Kings, emperors and queens in history stories',
    personality: 'Grand, impatient, easily impressed by shiny things.',
    look: {
      skin: '#FFEFCD',
      hair: 'long',
      hairColor: '#2A1A12',
      outfit: 'robe',
      top: '#1E3A6E',
      topShade: '#16295A',
      accent: '#F5C242',
      accent2: '#DB1F23',
      hat: 'crown',
      hatColor: '#F5C242',
      hatAccent: '#DB1F23',
      facial: 'beard',
    },
  },
} satisfies Record<string, CastMember>;

export type CastId = keyof typeof CAST;
export const CAST_IDS = Object.keys(CAST) as CastId[];

// Seeded crowd extras: palette-only colors (A4.4).
export const EXTRA_SKINS = ['#FFEFCD', '#FFEFCD', '#F4D2A6', '#D9A06B', '#B8743F', '#7E4E2B'];
export const EXTRA_TOPS = ['#1F8A8A', '#1E3A6E', '#F5C242', '#8E2F3C', '#3CC4C0', '#8A5A3B', '#B6ADE6', '#6FAA7C', '#DB1F23'];
export const EXTRA_HAIR = ['#1C1C1C', '#3B2418', '#4A3226', '#8C4A1B', '#C9CED6'];
