import { RANKS, SUITS } from '@poker/evaluation/cards';
import type { Card, Rank, Suit } from '@poker/evaluation/cards';

const isRank = (value: string): value is Rank =>
  (RANKS as readonly string[]).includes(value);

const isSuit = (value: string): value is Suit =>
  (SUITS as readonly string[]).includes(value);

export const parseCardCodes = (codes: string): Card[] =>
  codes
    .split(' ')
    .filter((code) => code.length > 0)
    .map((code) => {
      const rank = code.slice(0, -1);
      const suit = code.slice(-1);
      if (!isRank(rank) || !isSuit(suit)) {
        throw new Error(`Unknown card ${code}`);
      }
      return { rank, suit };
    });
