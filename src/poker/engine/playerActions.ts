import { commitChips, getLegalDecisions } from './bettingRules';
import { progressHand } from './handProgress';
import { getSeat, isInHand } from './seatOrder';
import type { Decision, TableState } from './tableTypes';

const AGGRESSIVE_DECISIONS: readonly Decision[] = ['bet', 'raise'] as const;

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
  seat.hasActed = true;
  seat.hasFolded = decision === 'fold';
  commitChips(table, seat, legalDecision.amount, decision);
  if (AGGRESSIVE_DECISIONS.includes(decision)) {
    table.currentBet = seat.streetContribution;
    table.raisesThisStreet += decision === 'raise' ? 1 : 0;
    for (const otherSeat of table.seats) {
      otherSeat.hasActed = otherSeat.seatPosition === seatPosition;
    }
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
