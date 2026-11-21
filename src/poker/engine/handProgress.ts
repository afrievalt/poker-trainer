import { bettingStreetOf } from './bettingRules';
import { canAct, nextSeatAfter, playersInHand } from './seatOrder';
import { settleHand } from './settleHand';
import type { BettingStreet, Seat, TableState } from './tableTypes';

const NEXT_STREET: Record<BettingStreet, BettingStreet | 'showdown'> = {
  preflop: 'flop',
  flop: 'turn',
  turn: 'river',
  river: 'showdown',
} as const;

const BOARD_CARD_COUNTS: Record<BettingStreet, number> = {
  preflop: 0,
  flop: 3,
  turn: 1,
  river: 1,
} as const;

const MINIMUM_ACTIVE_PLAYERS = 2;

const needsToAct =
  (table: TableState) =>
  (seat: Seat): boolean =>
    canAct(seat) &&
    (!seat.hasActed || seat.streetContribution < table.currentBet);

const advanceStreet = (table: TableState): void => {
  const nextStreet = NEXT_STREET[bettingStreetOf(table)];
  if (nextStreet === 'showdown') {
    settleHand(table);
    return;
  }
  table.street = nextStreet;
  table.board.push(...table.deck.splice(0, BOARD_CARD_COUNTS[nextStreet]));
  table.currentBet = 0;
  table.raisesThisStreet = 0;
  for (const seat of table.seats) {
    seat.streetContribution = 0;
    seat.hasActed = false;
  }
  // With fewer than two players able to bet, run the board out.
  if (table.seats.filter(canAct).length < MINIMUM_ACTIVE_PLAYERS) {
    advanceStreet(table);
    return;
  }
  table.actingSeat =
    nextSeatAfter(table, table.buttonSeat, canAct)?.seatPosition ?? null;
};

// Moves play to the next player, the next street, or the payout.
export const progressHand = (table: TableState): void => {
  if (playersInHand(table).length === 1) {
    settleHand(table);
    return;
  }
  const startSeat = table.actingSeat ?? table.buttonSeat;
  const nextActor = nextSeatAfter(table, startSeat, needsToAct(table));
  if (nextActor) {
    table.actingSeat = nextActor.seatPosition;
    return;
  }
  advanceStreet(table);
};
