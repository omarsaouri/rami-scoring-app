import type { GameVariant } from './db';

export interface CustomRules {
  winnerBonus: boolean;
  aceAlwaysTen: boolean;
}

export const DEFAULT_RULES: CustomRules = {
  winnerBonus: false,
  aceAlwaysTen: true,
};

export const THRESHOLDS = [501, 701, 1001] as const;
export type ScoreThreshold = (typeof THRESHOLDS)[number];

export interface VariantDef {
  id: GameVariant;
  label: string;
  descKey: string;
  cards: number;
}

export const VARIANTS: VariantDef[] = [
  {
    id: 'simple',
    label: 'Simple',
    descKey: 'variants.simpleDesc',
    cards: 13,
  },
  {
    id: '71',
    label: '71',
    descKey: 'variants.tallageDesc',
    cards: 14,
  },
  {
    id: '71_bla_joker',
    label: '71 Bla Joker',
    descKey: 'variants.blaJokerDesc',
    cards: 14,
  },
];

const FACE_CARD_NAMES = ['Valet', 'Dame', 'Roi', 'J', 'Q', 'K'];
const ACE_NAMES = ['As', 'A', 'Ace'];

export function cardValue(card: string, aceAlwaysTen = true): number {
  const c = card.trim();
  if (ACE_NAMES.some((a) => c.toUpperCase() === a.toUpperCase())) {
    return aceAlwaysTen ? 10 : 1;
  }
  if (FACE_CARD_NAMES.some((f) => c.toUpperCase() === f.toUpperCase())) {
    return 10;
  }
  const num = parseInt(c, 10);
  if (!isNaN(num) && num >= 2 && num <= 10) return num;
  return 0;
}

export const FLAT_PENALTY = 100;
export const TEAM_PENALTY = 200;
export const WINNER_BONUS = -20;
