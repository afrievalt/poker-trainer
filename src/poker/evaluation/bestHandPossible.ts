import type { Card } from './cards';
import { getTwoCardCombos, getThreeCardCombos } from './handCombos';
import { compareHighHands } from './handComparison';
import { RANK_VALUES } from './handConstants';
import { compareLowRanks } from './lowEvaluation';

export interface HandBestResult {
  bestHighHand: Card[]; // The 5-card hand (2 hole + 3 community)
  bestHighHoleIndices: number[]; // Indices of the 2 hole cards
  bestLowHand: number[] | null; // The 5 ranks
  bestLowHoleIndices: number[] | null; // Indices of the 2 hole cards
}

export const getLowRanks = (hand: Card[]): number[] | null => {
  const values = hand.map((card) => {
    const v = RANK_VALUES[card.rank];
    return v === 14 ? 1 : v; // Ace is 1 for low
  });
  if (values.some((value) => value > 8)) return null;
  const unique = [...new Set(values)];
  if (unique.length !== 5) return null;
  return unique.sort((a, b) => a - b);
};

export const getHandBestPossible = (
  community: Card[],
  hole: Card[],
): HandBestResult => {
  const holeCombos = getTwoCardCombos(hole);
  const boardCombos = getThreeCardCombos(community);

  let bestHigh: Card[] | null = null;
  let bestHighHoleIndices: number[] = [];

  for (const hCombo of holeCombos) {
    const hIndices = hole
      .map((c, idx) => (hCombo.includes(c) ? idx : -1))
      .filter((idx) => idx !== -1);
    for (const bCombo of boardCombos) {
      const fullHand = [...hCombo, ...bCombo];
      if (!bestHigh || compareHighHands(fullHand, bestHigh) > 0) {
        bestHigh = fullHand;
        bestHighHoleIndices = hIndices;
      }
    }
  }

  let bestLow: number[] | null = null;
  let bestLowHoleIndices: number[] | null = null;

  for (const hCombo of holeCombos) {
    const hIndices = hole
      .map((c, idx) => (hCombo.includes(c) ? idx : -1))
      .filter((idx) => idx !== -1);
    for (const bCombo of boardCombos) {
      const fullHand = [...hCombo, ...bCombo];
      const lowRanks = getLowRanks(fullHand);
      if (!lowRanks) continue;
      if (!bestLow || compareLowRanks(lowRanks, bestLow) < 0) {
        bestLow = lowRanks;
        bestLowHoleIndices = hIndices;
      }
    }
  }

  return {
    bestHighHand: bestHigh!,
    bestHighHoleIndices,
    bestLowHand: bestLow,
    bestLowHoleIndices,
  };
};
