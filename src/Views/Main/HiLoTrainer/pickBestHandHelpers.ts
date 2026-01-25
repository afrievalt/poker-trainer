import type { Card } from '@trainer/cards';

import { getLowRanks } from './bestHandPossible';
import { getTwoCardCombos, getThreeCardCombos } from './handCombos';
import { compareHighHands } from './handComparison';
import { compareLowRanks } from './lowEvaluation';

interface HandResult {
  bestHighHand: Card[];
  bestLowHand: number[] | null;
}

export const findAbsoluteBest = (handResults: HandResult[]) => {
  let absoluteBestHigh: Card[] | null = null;
  let absoluteBestLow: number[] | null = null;

  handResults.forEach((res) => {
    if (
      !absoluteBestHigh ||
      compareHighHands(res.bestHighHand, absoluteBestHigh) > 0
    ) {
      absoluteBestHigh = res.bestHighHand;
    }
    if (res.bestLowHand) {
      if (
        !absoluteBestLow ||
        compareLowRanks(res.bestLowHand, absoluteBestLow) < 0
      ) {
        absoluteBestLow = res.bestLowHand;
      }
    }
  });

  return { absoluteBestHigh, absoluteBestLow };
};

export const findWinningIndices = (
  handResults: HandResult[],
  absoluteBestHigh: Card[],
  absoluteBestLow: number[] | null,
) => {
  const winningHighHandIndices: number[] = [];
  const winningLowHandIndices: number[] = [];

  handResults.forEach((res, idx) => {
    if (compareHighHands(res.bestHighHand, absoluteBestHigh) === 0) {
      winningHighHandIndices.push(idx);
    }
    if (
      absoluteBestLow &&
      res.bestLowHand &&
      compareLowRanks(res.bestLowHand, absoluteBestLow) === 0
    ) {
      winningLowHandIndices.push(idx);
    }
  });

  return { winningHighHandIndices, winningLowHandIndices };
};

export const checkUserSelection = (
  hands: Card[][],
  selectedIndices: number[][],
  community: Card[],
  absoluteBestHigh: Card[],
  absoluteBestLow: number[] | null,
) => {
  return hands.map((h, i) => {
    const selected = selectedIndices[i];
    if (selected.length === 0)
      return { canMakeBestHigh: false, canMakeBestLow: false };

    const selectedCards = selected.map((idx) => h[idx]);
    const combos = getTwoCardCombos(selectedCards);

    let canMakeBestHigh = false;
    let canMakeBestLow = false;

    for (const combo of combos) {
      const boardCombos = getThreeCardCombos(community);
      for (const bCombo of boardCombos) {
        const full = [...combo, ...bCombo];
        if (compareHighHands(full, absoluteBestHigh) === 0)
          canMakeBestHigh = true;
        const low = getLowRanks(full);
        if (
          absoluteBestLow &&
          low &&
          compareLowRanks(low, absoluteBestLow) === 0
        )
          canMakeBestLow = true;
      }
    }
    return { canMakeBestHigh, canMakeBestLow };
  });
};
