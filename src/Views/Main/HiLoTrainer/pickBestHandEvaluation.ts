import type { Card } from '@trainer/cards';

import { getHandBestPossible } from './bestHandPossible';
import { evaluateHighHand } from './handEvaluation';
import {
  checkUserSelection,
  findAbsoluteBest,
  findWinningIndices,
} from './pickBestHandHelpers';

export const evaluatePickBestHand = (
  community: Card[],
  hands: Card[][],
  selectedIndices: number[][],
) => {
  const handResults = hands.map((h) => getHandBestPossible(community, h));
  const { absoluteBestHigh, absoluteBestLow } = findAbsoluteBest(handResults);
  const { winningHighHandIndices, winningLowHandIndices } = findWinningIndices(
    handResults,
    absoluteBestHigh!,
    absoluteBestLow,
  );

  const userResults = checkUserSelection(
    hands,
    selectedIndices,
    community,
    absoluteBestHigh!,
    absoluteBestLow,
  );

  let isHighCorrect = true;
  let isLowCorrect = true;

  winningHighHandIndices.forEach((idx) => {
    if (!userResults[idx].canMakeBestHigh) isHighCorrect = false;
  });
  winningLowHandIndices.forEach((idx) => {
    if (!userResults[idx].canMakeBestLow) isLowCorrect = false;
  });

  userResults.forEach((res, idx) => {
    if (
      selectedIndices[idx].length > 0 &&
      !winningHighHandIndices.includes(idx) &&
      !winningLowHandIndices.includes(idx)
    ) {
      isHighCorrect = false;
    }
  });

  return {
    absoluteBestHigh: evaluateHighHand(absoluteBestHigh!),
    absoluteBestLow: absoluteBestLow ? formatLow(absoluteBestLow) : 'no low',
    isCorrect: isHighCorrect && isLowCorrect,
    isHighCorrect,
    isLowCorrect,
    winningHighHandIndices,
    winningLowHandIndices,
  };
};

const formatLow = (ranks: number[]): string => {
  if (ranks.join(',') === '1,2,3,4,5') {
    return 'wheel';
  }
  return `${ranks[ranks.length - 1]}-low`;
};
