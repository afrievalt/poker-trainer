import type { Card } from './cards';

export const SUIT_SYMBOLS: Record<Card['suit'], string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
} as const;

export const formatCards = (cards: Card[]): string =>
  cards.map((card) => `${card.rank}${SUIT_SYMBOLS[card.suit]}`).join(' ');
