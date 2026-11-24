import { getSeat, playersInHand } from './seatOrder';
import type {
  ActionRecord,
  BettingStreet,
  Decision,
  LegalDecision,
  Seat,
  TableState,
} from './tableTypes';

const BETTING_STREETS: readonly BettingStreet[] = [
  'preflop',
  'flop',
  'turn',
  'river',
] as const;

const HEADS_UP_PLAYER_COUNT = 2;

export const bettingStreetOf = (table: TableState): BettingStreet => {
  const street = BETTING_STREETS.find(
    (candidate) => candidate === table.street,
  );
  if (!street) {
    throw new Error(`No betting happens on street ${table.street}`);
  }
  return street;
};

export const getBetSize = (table: TableState): number => {
  const { betSizes, kill } = table.structure;
  const streetBetSizes = table.killSeat === null ? betSizes : kill.betSizes;
  return streetBetSizes[bettingStreetOf(table)];
};

export const isCapReached = (table: TableState): boolean => {
  const { isCapLiftedHeadsUp, raisesPerStreet } = table.structure;
  const isHeadsUp = playersInHand(table).length === HEADS_UP_PLAYER_COUNT;
  const isCapLifted = isCapLiftedHeadsUp && isHeadsUp;
  return table.raisesThisStreet >= raisesPerStreet && !isCapLifted;
};

// A short stack can bet or raise all-in. A raise smaller than a full bet
// does not reopen the action for someone who has already acted.
export const getLegalDecisions = (
  table: TableState,
  seatPosition: number,
): LegalDecision[] => {
  if (table.actingSeat !== seatPosition) {
    return [];
  }
  const seat = getSeat(table, seatPosition);
  const owed = table.currentBet - seat.streetContribution;
  const betSize = getBetSize(table);
  const fullAmount = table.currentBet === 0 ? betSize : owed + betSize;
  const aggressiveDecision: Decision = table.currentBet === 0 ? 'bet' : 'raise';
  const hasChipsToWager =
    table.currentBet === 0 ? seat.stack > 0 : seat.stack > owed;
  const canWager = !isCapReached(table) && !seat.hasActed && hasChipsToWager;
  const passiveDecisions: LegalDecision[] =
    owed > 0
      ? [
          { decision: 'fold', amount: 0 },
          { decision: 'call', amount: Math.min(owed, seat.stack) },
        ]
      : [{ decision: 'check', amount: 0 }];
  const aggressiveDecisions: LegalDecision[] = canWager
    ? [
        {
          decision: aggressiveDecision,
          amount: Math.min(fullAmount, seat.stack),
        },
      ]
    : [];
  return [...passiveDecisions, ...aggressiveDecisions];
};

export const commitChips = (
  table: TableState,
  seat: Seat,
  amount: number,
  decision: ActionRecord['decision'],
): void => {
  const committed = Math.min(amount, seat.stack);
  seat.stack -= committed;
  seat.streetContribution += committed;
  seat.handContribution += committed;
  table.actionHistory.push({
    seatPosition: seat.seatPosition,
    street: bettingStreetOf(table),
    decision,
    amount: committed,
    streetTotal: seat.streetContribution,
  });
};
