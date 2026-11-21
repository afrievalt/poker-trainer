import type { Card } from '@trainer/cards';
import { createDeck, getCardCode } from '@trainer/cards';
import { HIGH_HAND_RANKS } from '@trainer/handConstants';

import type { HighHandDetails } from './handEvaluation';
import { compareLowRanks, getBestOmahaLowHand } from './lowEvaluation';
import { getBestOmahaHighDetails } from './omahaEvaluation';

export interface CommunityHiLoOutcome {
  high: HighHandDetails;
  low: number[] | null;
}

const getRemainingDeck = (community: Card[]): Card[] => {
  const taken = new Set(community.map(getCardCode));
  return createDeck().filter((card) => !taken.has(getCardCode(card)));
};

// eslint-disable-next-line complexity
export const getBestPossibleOmahaHiLoFromCommunity = (
  community: Card[],
): CommunityHiLoOutcome => {
  const remaining = getRemainingDeck(community);
  let bestHigh: HighHandDetails | null = null;
  let bestLow: number[] | null = null;

  for (let first = 0; first < remaining.length - 1; first += 1) {
    for (let second = first + 1; second < remaining.length; second += 1) {
      const hole = [remaining[first], remaining[second]];
      const high = getBestOmahaHighDetails(community, hole);
      if (
        !bestHigh ||
        HIGH_HAND_RANKS[high.category] > HIGH_HAND_RANKS[bestHigh.category] ||
        (HIGH_HAND_RANKS[high.category] ===
          HIGH_HAND_RANKS[bestHigh.category] &&
          high.straightHigh &&
          bestHigh.straightHigh &&
          high.straightHigh > bestHigh.straightHigh)
      ) {
        bestHigh = high;
      }

      const low = getBestOmahaLowHand(community, hole);
      if (low && (!bestLow || compareLowRanks(low, bestLow) < 0)) {
        bestLow = low;
      }
    }
  }

  return {
    high: bestHigh ?? { category: 'High Card', straightHigh: null },
    low: bestLow,
  };
};
