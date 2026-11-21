import type { Card } from '@poker/evaluation/cards';

import { commitChips } from './bettingRules';
import { progressHand } from './handProgress';
import {
  getSeat,
  nextSeatAfter,
  requireSeatAfter,
  seatsFromButton,
} from './seatOrder';
import type { Seat, TableState } from './tableTypes';

const HOLE_CARD_COUNT = 5;
const MINIMUM_PLAYERS = 2;

const isFunded = (seat: Seat): boolean => seat.stack > 0;
const isDealtIn = (seat: Seat): boolean => seat.isDealtIn;

const rebuyBustedRobots = (table: TableState): void => {
  for (const seat of table.seats) {
    if (!seat.isHero && seat.stack === 0) {
      seat.stack = table.structure.startingStack;
    }
  }
};

const resetSeat = (seat: Seat, isDealtInThisHand: boolean): void => {
  seat.holeCards = [];
  seat.isDealtIn = isDealtInThisHand;
  seat.hasFolded = false;
  seat.hasActed = false;
  seat.streetContribution = 0;
  seat.handContribution = 0;
};

const resetTable = (table: TableState, deck: Card[]): void => {
  table.handNumber += 1;
  table.street = 'preflop';
  table.deck = [...deck];
  table.board = [];
  table.currentBet = 0;
  table.raisesThisStreet = 0;
  table.actionHistory = [];
  table.lastResult = null;
};

// Kills are posted in the order they were won. A scooper on the button
// keeps their kill (and everyone queued behind) until the next hand;
// a scooper who is not dealt in for any other reason loses it.
const takeKillSeat = (table: TableState): number | null => {
  const [nextKiller] = table.pendingKillSeats;
  const isOnButton =
    table.structure.isButtonSittingOut && nextKiller === table.buttonSeat;
  if (nextKiller === undefined || isOnButton) {
    return null;
  }
  table.pendingKillSeats.shift();
  return getSeat(table, nextKiller).isDealtIn ? nextKiller : null;
};

const postForcedBets = (table: TableState): void => {
  const { blinds, kill } = table.structure;
  const smallBlind = requireSeatAfter(table, table.buttonSeat, isDealtIn);
  const bigBlind = requireSeatAfter(table, smallBlind.seatPosition, isDealtIn);
  commitChips(table, smallBlind, blinds.small, 'smallBlind');
  commitChips(table, bigBlind, blinds.big, 'bigBlind');
  table.killSeat = takeKillSeat(table);
  const killer = table.seats.find(
    (seat) => seat.seatPosition === table.killSeat,
  );
  if (killer) {
    commitChips(
      table,
      killer,
      kill.bringIn - killer.streetContribution,
      'kill',
    );
  }
  table.currentBet = killer ? kill.bringIn : blinds.big;
  // The killer, or else the big blind, acts last before the flop.
  table.actingSeat = (killer ?? bigBlind).seatPosition;
};

export const startHand = (table: TableState, deck: Card[]): void => {
  if (table.street !== 'waiting' && table.street !== 'complete') {
    return;
  }
  rebuyBustedRobots(table);
  const buttonSeat =
    nextSeatAfter(table, table.buttonSeat, isFunded)?.seatPosition ??
    table.buttonSeat;
  const { isButtonSittingOut } = table.structure;
  const isPlaying = (seat: Seat): boolean =>
    isFunded(seat) && !(isButtonSittingOut && seat.seatPosition === buttonSeat);
  if (table.seats.filter(isPlaying).length < MINIMUM_PLAYERS) {
    return;
  }
  table.buttonSeat = buttonSeat;
  resetTable(table, deck);
  for (const seat of table.seats) {
    resetSeat(seat, isPlaying(seat));
  }
  for (const seat of seatsFromButton(table).filter(isDealtIn)) {
    seat.holeCards = table.deck.splice(0, HOLE_CARD_COUNT);
  }
  postForcedBets(table);
  progressHand(table);
};
