import { getHandBestPossible } from '@poker/evaluation/bestHandPossible';
import type { Card } from '@poker/evaluation/cards';
import { createDeck, getCardCode } from '@poker/evaluation/cards';
import { compareHighHands } from '@poker/evaluation/handComparison';
import { compareLowRanks } from '@poker/evaluation/lowEvaluation';

const HOLE_CARD_COUNT = 5;
const BOARD_SIZE = 5;
const HALF_POT = 0.5;

export interface EquityRequest {
  holeCards: Card[];
  board: Card[];
  opponentCount: number;
  iterations: number;
  random: () => number;
}

// Draws cards from the end of the pool with a partial Fisher-Yates shuffle.
const drawCards = (pool: Card[], count: number, random: () => number) => {
  const drawn: Card[] = [];
  for (let drawCount = 0; drawCount < count; drawCount += 1) {
    const lastSlot = pool.length - 1 - drawCount;
    const pickedSlot = Math.floor(random() * (lastSlot + 1));
    [pool[pickedSlot], pool[lastSlot]] = [pool[lastSlot], pool[pickedSlot]];
    drawn.push(pool[lastSlot]);
  }
  return drawn;
};

const shareOfWinners = (winnerFlags: boolean[]): number => {
  const winnerCount = winnerFlags.filter(Boolean).length;
  return winnerFlags[0] ? 1 / winnerCount : 0;
};

const pickBest = <Entry>(
  entries: Entry[],
  isBetter: (candidate: Entry, leader: Entry) => boolean,
): Entry => {
  let [best] = entries;
  for (const entry of entries) {
    best = isBetter(entry, best) ? entry : best;
  }
  return best;
};

// Pot share for player zero on one complete board.
const heroShare = (hands: Card[][], board: Card[]): number => {
  const bests = hands.map((hand) => getHandBestPossible(board, hand));
  const bestHigh = pickBest(
    bests,
    (candidate, leader) =>
      compareHighHands(candidate.bestHighHand, leader.bestHighHand) > 0,
  ).bestHighHand;
  const highShare = shareOfWinners(
    bests.map((best) => compareHighHands(best.bestHighHand, bestHigh) === 0),
  );
  const lows = bests.map((best) => best.bestLowHand);
  const qualifiedLows = lows.filter((low): low is number[] => low !== null);
  if (qualifiedLows.length === 0) {
    return highShare;
  }
  const bestLow = pickBest(
    qualifiedLows,
    (candidate, leader) => compareLowRanks(candidate, leader) < 0,
  );
  const lowShare = shareOfWinners(
    lows.map((low) => low !== null && compareLowRanks(low, bestLow) === 0),
  );
  return HALF_POT * highShare + HALF_POT * lowShare;
};

// Estimated fraction of the pot this hand wins against random opponents.
export const estimatePotEquity = (request: EquityRequest): number => {
  const { board, holeCards, iterations, opponentCount, random } = request;
  const knownCodes = new Set([...holeCards, ...board].map(getCardCode));
  const unseenCards = createDeck().filter(
    (card) => !knownCodes.has(getCardCode(card)),
  );
  const missingBoardCount = BOARD_SIZE - board.length;
  let totalShare = 0;
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const drawn = drawCards(
      unseenCards,
      opponentCount * HOLE_CARD_COUNT + missingBoardCount,
      random,
    );
    const opponentHands = Array.from(
      { length: opponentCount },
      (_unused, seat) =>
        drawn.slice(seat * HOLE_CARD_COUNT, (seat + 1) * HOLE_CARD_COUNT),
    );
    const fullBoard = [
      ...board,
      ...drawn.slice(opponentCount * HOLE_CARD_COUNT),
    ];
    totalShare += heroShare([holeCards, ...opponentHands], fullBoard);
  }
  return totalShare / iterations;
};
