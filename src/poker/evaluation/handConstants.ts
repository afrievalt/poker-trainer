import type { Rank } from './cards';

export const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export const LOW_RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 1,
};

export const HIGH_HAND_OPTIONS = [
  'High Card',
  'One Pair',
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
] as const;

export type HighHandLabel = (typeof HIGH_HAND_OPTIONS)[number];

export const LOW_HAND_OPTIONS = [
  'wheel',
  '6-low',
  '7-low',
  '8-low',
  'no low',
] as const;

export type LowHandLabel = (typeof LOW_HAND_OPTIONS)[number];

export const STRAIGHT_HIGH_OPTIONS = [
  'A',
  'K',
  'Q',
  'J',
  'T',
  '9',
  '8',
  '7',
  '6',
  '5',
] as const;

export type StraightHighLabel = (typeof STRAIGHT_HIGH_OPTIONS)[number];

export const HIGH_HAND_RANKS: Record<HighHandLabel, number> = {
  'High Card': 1,
  'One Pair': 2,
  'Two Pair': 3,
  'Three of a Kind': 4,
  Straight: 5,
  Flush: 6,
  'Full House': 7,
  'Four of a Kind': 8,
  'Straight Flush': 9,
};
