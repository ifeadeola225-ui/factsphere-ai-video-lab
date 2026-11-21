// Recurring cast. STATE 2 has only the Everyman prototype (ODD's starting design); the full cast comes in STATE 3.

export type Look = {
  skin: string;
  hair: 'none' | 'swoop' | 'spiky';
  hairColor: string;
  outfit: 'hoodie' | 'suit' | 'plain';
  top: string;
  topShade?: string;
  accent?: string;
};

export const CAST = {
  everyman: {
    skin: '#FFEFCD', // warm cream head (brief 0.1)
    hair: 'swoop',
    hairColor: '#3B2418',
    outfit: 'hoodie',
    top: '#1F8A8A', // brand teal
    topShade: '#176B6B',
    accent: '#F5C242', // warm yellow cords
  },
} satisfies Record<string, Look>;

export type CastId = keyof typeof CAST;
