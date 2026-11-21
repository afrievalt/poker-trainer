import { awardPot } from './potAwards';
import { buildPots } from './pots';
import { takeRake } from './rake';
import { getSeat } from './seatOrder';
import type { PotAward, TableState } from './tableTypes';

const findScooper = (
  table: TableState,
  awards: PotAward[],
  potTotal: number,
): number | null => {
  const { kill } = table.structure;
  const winnerSeats = [...new Set(awards.map((award) => award.seatPosition))];
  const [onlyWinner] = winnerSeats;
  const isScoop = winnerSeats.length === 1 && potTotal >= kill.minimumPot;
  const isAllowedToKillAgain =
    kill.isRepeatable || onlyWinner !== table.killSeat;
  return isScoop && isAllowedToKillAgain ? onlyWinner : null;
};

// The kill is judged on the pot before the rake comes out.
export const settleHand = (table: TableState): void => {
  const pots = buildPots(table);
  const contestedPots = pots.filter((pot) => !pot.isUncalled);
  const potTotal = contestedPots
    .map((pot) => pot.amount)
    .reduce((total, amount) => total + amount, 0);
  const rake = takeRake(table.structure.rakeSteps, contestedPots, potTotal);
  let returnedAmount = 0;
  let returnedTo: number | null = null;
  for (const pot of pots.filter((uncalledPot) => uncalledPot.isUncalled)) {
    returnedAmount += pot.amount;
    returnedTo = pot.eligibleSeats[0];
    getSeat(table, returnedTo).stack += pot.amount;
  }
  const awards = contestedPots.flatMap((pot) => awardPot(table, pot));
  for (const award of awards) {
    getSeat(table, award.seatPosition).stack += award.amount;
  }
  const scooperSeat = findScooper(table, awards, potTotal);
  table.lastResult = {
    awards,
    returnedAmount,
    returnedTo,
    potTotal,
    rake,
    scooperSeat,
  };
  if (scooperSeat !== null) {
    table.pendingKillSeats.push(scooperSeat);
  }
  table.street = 'complete';
  table.actingSeat = null;
};
