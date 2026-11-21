/* eslint-disable max-depth */

import type { Card } from './cards';
import { LOW_RANK_VALUES } from './handConstants';

const MAX_LOW_RANK = 8;

const getLowRanks = (hand: Card[]): number[] | null => {
  const values = hand.map((card) => LOW_RANK_VALUES[card.rank]);
  if (values.some((value) => value > MAX_LOW_RANK)) {
    return null;
  }
  const unique = [...new Set(values)];
  if (unique.length !== 5) {
    return null;
  }
  return unique.sort((a, b) => a - b);
};

export const compareLowRanks = (left: number[], right: number[]): number => {
  for (const [index, element] of left.entries()) {
    if (element !== right[index]) {
      return element - right[index];
    }
  }
  return 0;
};

export const getBestOmahaLowHand = (
  community: Card[],
  hole: Card[],
): number[] | null => {
  let best: number[] | null = null;
  for (let first = 0; first < hole.length - 1; first += 1) {
    for (let second = first + 1; second < hole.length; second += 1) {
      for (let third = 0; third < community.length - 2; third += 1) {
        for (
          let fourth = third + 1;
          fourth < community.length - 1;
          fourth += 1
        ) {
          for (let fifth = fourth + 1; fifth < community.length; fifth += 1) {
            const hand = [
              hole[first],
              hole[second],
              community[third],
              community[fourth],
              community[fifth],
            ];
            const ranks = getLowRanks(hand);
            if (!ranks) {
              continue;
            }
            if (!best || compareLowRanks(ranks, best) < 0) {
              best = ranks;
            }
          }
        }
      }
    }
  }
  return best;
};
