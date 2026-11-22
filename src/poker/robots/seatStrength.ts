import { bettingStreetOf } from '@poker/engine/bettingRules';
import { getSeat, playersInHand } from '@poker/engine/seatOrder';
import type { BettingStreet, TableState } from '@poker/engine/tableTypes';

import { estimatePotEquity } from './potEquity';
import { scoreStartingHand } from './startingHandScore';

// Samples times opponents stays near this, so a full table does not stall.
const EQUITY_PAIRINGS = 40;
const FEWEST_ITERATIONS = 12;

const iterationsFor = (opponentCount: number): number =>
  Math.max(FEWEST_ITERATIONS, Math.round(EQUITY_PAIRINGS / opponentCount));

export interface SeatStrength {
  street: BettingStreet;
  handStrength: number;
  playersInHand: number;
  // Zero before the flop, where handStrength is a starting-hand score.
  opponentsSimulated: number;
  amountToCall: number;
  potTotal: number;
}

const potTotalOf = (table: TableState): number =>
  table.seats.reduce((total, seat) => total + seat.handContribution, 0);

// Strength from this seat's point of view, against everyone still in the hand.
export const measureSeatStrength = (
  table: TableState,
  seatPosition: number,
  random: () => number,
): SeatStrength => {
  const seat = getSeat(table, seatPosition);
  const street = bettingStreetOf(table);
  const contenderCount = playersInHand(table).length;
  const opponentsSimulated =
    street === 'preflop' ? 0 : Math.max(contenderCount - 1, 1);
  const handStrength =
    street === 'preflop'
      ? scoreStartingHand(seat.holeCards)
      : estimatePotEquity({
          holeCards: seat.holeCards,
          board: table.board,
          opponentCount: opponentsSimulated,
          iterations: iterationsFor(opponentsSimulated),
          random,
        });
  return {
    street,
    handStrength,
    playersInHand: contenderCount,
    opponentsSimulated,
    amountToCall: table.currentBet - seat.streetContribution,
    potTotal: potTotalOf(table),
  };
};
