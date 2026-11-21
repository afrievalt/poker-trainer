import { getHandBestPossible } from '@poker/evaluation/bestHandPossible';
import type { Card } from '@poker/evaluation/cards';
import { compareHighHands } from '@poker/evaluation/handComparison';
import { compareLowRanks } from '@poker/evaluation/lowEvaluation';

import type { Pot } from './pots';
import { seatsFromButton } from './seatOrder';
import type { PotAward, PotShare, TableState } from './tableTypes';

interface ShowdownHand {
  seatPosition: number;
  highHand: Card[];
  lowRanks: number[] | null;
}

interface LowHand {
  seatPosition: number;
  lowRanks: number[];
}

const HALF = 2;

// Every entry that ties the best one; order is kept for odd chips.
const bestEntries = <Entry>(
  entries: Entry[],
  compare: (left: Entry, right: Entry) => number,
): Entry[] => {
  let [best] = entries;
  for (const entry of entries) {
    best = compare(entry, best) > 0 ? entry : best;
  }
  return entries.filter((entry) => compare(entry, best) === 0);
};

// Splits in whole chips; odd chips go to the first winners clockwise from
// the button.
const splitAmong = (
  winners: { seatPosition: number }[],
  amount: number,
  share: PotShare,
  smallestChip: number,
): PotAward[] => {
  const chipCount = Math.round(amount / smallestChip);
  const baseChips = Math.floor(chipCount / winners.length);
  const oddChips = chipCount % winners.length;
  return winners.map((winner, winnerOrder) => ({
    seatPosition: winner.seatPosition,
    amount: (baseChips + (winnerOrder < oddChips ? 1 : 0)) * smallestChip,
    share,
  }));
};

export const awardPot = (table: TableState, pot: Pot): PotAward[] => {
  const { smallestChip } = table.structure;
  const contenders = seatsFromButton(table).filter((seat) =>
    pot.eligibleSeats.includes(seat.seatPosition),
  );
  if (contenders.length === 1) {
    return splitAmong(contenders, pot.amount, 'uncontested', smallestChip);
  }
  const hands: ShowdownHand[] = contenders.map((seat) => {
    const best = getHandBestPossible(table.board, seat.holeCards);
    return {
      seatPosition: seat.seatPosition,
      highHand: best.bestHighHand,
      lowRanks: best.bestLowHand,
    };
  });
  const highWinners = bestEntries(hands, (left, right) =>
    compareHighHands(left.highHand, right.highHand),
  );
  const lowHands: LowHand[] = hands.flatMap(({ lowRanks, seatPosition }) =>
    lowRanks ? [{ seatPosition, lowRanks }] : [],
  );
  const lowWinners =
    lowHands.length > 0
      ? bestEntries(lowHands, (left, right) =>
          compareLowRanks(right.lowRanks, left.lowRanks),
        )
      : [];
  const lowChips = Math.floor(Math.round(pot.amount / smallestChip) / HALF);
  const lowAmount = lowWinners.length > 0 ? lowChips * smallestChip : 0;
  const highAwards = splitAmong(
    highWinners,
    pot.amount - lowAmount,
    'high',
    smallestChip,
  );
  const lowAwards =
    lowWinners.length > 0
      ? splitAmong(lowWinners, lowAmount, 'low', smallestChip)
      : [];
  return [...highAwards, ...lowAwards];
};
