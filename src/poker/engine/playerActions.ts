import { commitChips, getBetSize, getLegalDecisions } from './bettingRules';
import { progressHand } from './handProgress';
import { getSeat, isInHand } from './seatOrder';
import type { Decision, Seat, TableState } from './tableTypes';

const AGGRESSIVE_DECISIONS: readonly Decision[] = ['bet', 'raise'] as const;

// An opening bet always starts the action. A short all-in raise only
// increases the price; players who already acted may call, not raise.
const applyAggressiveWager = (
  table: TableState,
  seat: Seat,
  decision: Decision,
  facedBet: number,
): void => {
  const isFullWager = seat.streetContribution >= facedBet + getBetSize(table);
  const opensAction = decision === 'bet' || isFullWager;
  table.currentBet = seat.streetContribution;
  if (!opensAction) {
    return;
  }
  table.raisesThisStreet += decision === 'raise' ? 1 : 0;
  for (const otherSeat of table.seats) {
    otherSeat.hasActed = otherSeat.seatPosition === seat.seatPosition;
  }
};

// Ignores decisions that are out of turn or not legal right now.
export const applyDecision = (
  table: TableState,
  seatPosition: number,
  decision: Decision,
): void => {
  const legalDecision = getLegalDecisions(table, seatPosition).find(
    (legal) => legal.decision === decision,
  );
  if (!legalDecision) {
    return;
  }
  const seat = getSeat(table, seatPosition);
  const facedBet = table.currentBet;
  seat.hasActed = true;
  seat.hasFolded = decision === 'fold';
  commitChips(table, seat, legalDecision.amount, decision);
  if (AGGRESSIVE_DECISIONS.includes(decision)) {
    applyAggressiveWager(table, seat, decision, facedBet);
  }
  progressHand(table);
};

export const rebuyPlayer = (
  table: TableState,
  seatPosition: number,
  amount: number,
): void => {
  const seat = getSeat(table, seatPosition);
  const isPlayingHand = isInHand(seat) && table.street !== 'complete';
  if (amount <= 0 || isPlayingHand) {
    return;
  }
  seat.stack += amount;
};
