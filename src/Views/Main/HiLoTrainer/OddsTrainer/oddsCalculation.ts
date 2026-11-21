import type { Card } from '@poker/evaluation/cards';
import { createDeck, shuffleDeck } from '@poker/evaluation/cards';
import { compareHighHands } from '@poker/evaluation/handComparison';
import {
  getBestOmahaLowHand,
  compareLowRanks,
} from '@poker/evaluation/lowEvaluation';

export interface PlayerOdds {
  high: number;
  low: number;
  scoop: number;
}

const getTwoCardCombos = (cards: Card[]): Card[][] => {
  const combos: Card[][] = [];
  for (let i = 0; i < cards.length - 1; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      combos.push([cards[i], cards[j]]);
    }
  }
  return combos;
};

const getThreeCardCombos = (cards: Card[]): Card[][] => {
  const combos: Card[][] = [];
  for (let i = 0; i < cards.length - 2; i++) {
    for (let j = i + 1; j < cards.length - 1; j++) {
      for (let k = j + 1; k < cards.length; k++) {
        combos.push([cards[i], cards[j], cards[k]]);
      }
    }
  }
  return combos;
};

const getBestHighHand = (community: Card[], hole: Card[]): Card[] => {
  const holeCombos = getTwoCardCombos(hole);
  const boardCombos = getThreeCardCombos(community);
  let best: Card[] | null = null;
  for (const hc of holeCombos) {
    for (const bc of boardCombos) {
      const hand = [...hc, ...bc];
      if (best === null || compareHighHands(hand, best) > 0) {
        best = hand;
      }
    }
  }
  return best!;
};

const getHighWinners = (playerHands: Card[][], board: Card[]): number[] => {
  const bestHighHands = playerHands.map((hole) => getBestHighHand(board, hole));
  let bestHighIdx = 0;
  for (let i = 1; i < bestHighHands.length; i++) {
    if (compareHighHands(bestHighHands[i], bestHighHands[bestHighIdx]) > 0) {
      bestHighIdx = i;
    }
  }
  return bestHighHands
    .map((hand, i) =>
      compareHighHands(hand, bestHighHands[bestHighIdx]) === 0 ? i : -1,
    )
    .filter((i) => i !== -1);
};

const getLowWinners = (playerHands: Card[][], board: Card[]): number[] => {
  const bestLows = playerHands.map((hole) => getBestOmahaLowHand(board, hole));
  const qualifiedIdx = bestLows
    .map((ranks, i) => (ranks !== null ? i : -1))
    .filter((i) => i !== -1);
  if (qualifiedIdx.length === 0) return [];

  let bestLowIdx = qualifiedIdx[0];
  for (const idx of qualifiedIdx.slice(1)) {
    if (compareLowRanks(bestLows[idx]!, bestLows[bestLowIdx]!) < 0) {
      bestLowIdx = idx;
    }
  }
  return qualifiedIdx.filter(
    (idx) => compareLowRanks(bestLows[idx]!, bestLows[bestLowIdx]!) === 0,
  );
};

function evaluateRunout(
  playerHands: Card[][],
  board: Card[],
  highShare: number[],
  lowShare: number[],
  scoopShare: number[],
): void {
  const highWinners = getHighWinners(playerHands, board);
  const lowWinners = getLowWinners(playerHands, board);

  for (const p of highWinners) highShare[p] += 1 / highWinners.length;
  for (const p of lowWinners) lowShare[p] += 1 / lowWinners.length;

  if (
    highWinners.length === 1 &&
    lowWinners.length === 1 &&
    highWinners[0] === lowWinners[0]
  ) {
    scoopShare[highWinners[0]] += 1;
  }
}

const MONTE_CARLO_ITERATIONS = 800;

export function calculateOdds(
  playerHands: Card[][],
  communityCards: Card[],
): PlayerOdds[] {
  const n = playerHands.length;
  const highShare = new Array<number>(n).fill(0);
  const lowShare = new Array<number>(n).fill(0);
  const scoopShare = new Array<number>(n).fill(0);

  const cardKey = (c: Card) => `${c.rank}${c.suit}`;
  const allUsed = new Set([
    ...playerHands.flat().map(cardKey),
    ...communityCards.map(cardKey),
  ]);
  const remaining = createDeck().filter((c) => !allUsed.has(cardKey(c)));

  const cardsNeeded = 5 - communityCards.length;
  let simCount = 0;

  if (cardsNeeded === 0) {
    evaluateRunout(
      playerHands,
      communityCards,
      highShare,
      lowShare,
      scoopShare,
    );
    simCount = 1;
  } else if (cardsNeeded === 1) {
    for (const card of remaining) {
      evaluateRunout(
        playerHands,
        [...communityCards, card],
        highShare,
        lowShare,
        scoopShare,
      );
      simCount++;
    }
  } else if (cardsNeeded === 2) {
    for (let i = 0; i < remaining.length - 1; i++) {
      for (let j = i + 1; j < remaining.length; j++) {
        evaluateRunout(
          playerHands,
          [...communityCards, remaining[i], remaining[j]],
          highShare,
          lowShare,
          scoopShare,
        );
        simCount++;
      }
    }
  } else {
    // Monte Carlo for pre-flop (5 cards needed)
    for (let iter = 0; iter < MONTE_CARLO_ITERATIONS; iter++) {
      const shuffled = shuffleDeck(remaining);
      const board = [...communityCards, ...shuffled.slice(0, cardsNeeded)];
      evaluateRunout(playerHands, board, highShare, lowShare, scoopShare);
    }
    simCount = MONTE_CARLO_ITERATIONS;
  }

  return Array.from({ length: n }, (_, p) => ({
    high: (highShare[p] / simCount) * 100,
    low: (lowShare[p] / simCount) * 100,
    scoop: (scoopShare[p] / simCount) * 100,
  }));
}
