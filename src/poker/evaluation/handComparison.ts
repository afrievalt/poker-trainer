import type { Card } from '@trainer/cards';
import { RANK_VALUES } from '@trainer/handConstants';
import { HIGH_HAND_RANKS } from '@trainer/handConstants';

import { evaluateHighHand, getHighHandDetails } from './handEvaluation';

const getRankCounts = (hand: Card[]): Map<number, number> => {
  const counts = new Map<number, number>();
  hand.forEach((c) => {
    const v = RANK_VALUES[c.rank];
    counts.set(v, (counts.get(v) ?? 0) + 1);
  });
  return counts;
};

export const compareHighHands = (handA: Card[], handB: Card[]): number => {
  const catA = evaluateHighHand(handA);
  const catB = evaluateHighHand(handB);

  if (HIGH_HAND_RANKS[catA] !== HIGH_HAND_RANKS[catB]) {
    return HIGH_HAND_RANKS[catA] - HIGH_HAND_RANKS[catB];
  }

  const detailsA = getHighHandDetails(handA);
  const detailsB = getHighHandDetails(handB);

  // Straights and Straight Flushes
  if (detailsA.straightHigh && detailsB.straightHigh) {
    return detailsA.straightHigh - detailsB.straightHigh;
  }

  const countsA = getRankCounts(handA);
  const countsB = getRankCounts(handB);

  const keyA = getSortKey(countsA);
  const keyB = getSortKey(countsB);

  for (const [i, element] of keyA.entries()) {
    if (element[0] !== keyB[i][0]) return element[0] - keyB[i][0];
  }

  return 0;
};

const getSortKey = (counts: Map<number, number>) => {
  return [...counts.entries()].sort((a, b) => {
    if (a[1] !== b[1]) return b[1] - a[1];
    return b[0] - a[0];
  });
};
