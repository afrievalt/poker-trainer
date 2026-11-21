import { isCapReached } from '@poker/engine/bettingRules';
import { getSeat } from '@poker/engine/seatOrder';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type {
  Decision,
  LegalDecision,
  TableState,
} from '@poker/engine/tableTypes';

import { formatMoney } from './money';

// The action bar always shows three buttons in the same places:
// Fold, Check or Call, and Bet or Raise.
export interface DecisionButtonView {
  decision: Decision;
  label: string;
  isAvailable: boolean;
  blockedReason: string;
}

const DECISION_LABELS: Record<
  Decision,
  (amount: number, total: number) => string
> = {
  fold: () => 'Fold',
  check: () => 'Check',
  call: (amount) => `Call ${formatMoney(amount)}`,
  bet: (amount) => `Bet ${formatMoney(amount)}`,
  raise: (_amount, total) => `Raise to ${formatMoney(total)}`,
} as const;

const BLOCKED_NAMES: Record<Decision, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
} as const;

const BLOCKED_REASONS = {
  fold: 'There is no bet to fold to. Checking is free.',
  capped: 'Betting is capped this round. Call or fold.',
  shortStack: 'You do not have enough chips for a full bet.',
} as const;

export const describeDecisionButtons = (
  table: TableState,
  legalDecisions: LegalDecision[],
): DecisionButtonView[] => {
  const hero = getSeat(table, HERO_SEAT_POSITION);
  const isFacingBet = table.currentBet > hero.streetContribution;
  const passive: Decision = isFacingBet ? 'call' : 'check';
  const aggressive: Decision = table.currentBet === 0 ? 'bet' : 'raise';
  const buttonFor = (
    decision: Decision,
    blockedReason: string,
  ): DecisionButtonView => {
    const legal = legalDecisions.find(
      (candidate) => candidate.decision === decision,
    );
    return {
      decision,
      label: legal
        ? DECISION_LABELS[decision](
            legal.amount,
            hero.streetContribution + legal.amount,
          )
        : BLOCKED_NAMES[decision],
      isAvailable: legal !== undefined,
      blockedReason,
    };
  };
  const aggressiveReason = isCapReached(table)
    ? BLOCKED_REASONS.capped
    : BLOCKED_REASONS.shortStack;
  return [
    buttonFor('fold', BLOCKED_REASONS.fold),
    buttonFor(passive, ''),
    buttonFor(aggressive, aggressiveReason),
  ];
};
