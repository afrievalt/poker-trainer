import { bettingStreetOf, getLegalDecisions } from '@poker/engine/bettingRules';
import type {
  BettingStreet,
  Decision,
  TableState,
} from '@poker/engine/tableTypes';

const BEFORE_TARGET: readonly Decision[] = ['call', 'check', 'fold'];
const ON_TARGET: readonly Decision[] = ['check', 'call', 'fold'];
const FOLD_TO_HERO: readonly Decision[] = ['fold', 'check', 'call'];

// Keeps the hand moving until the hero's street, then gets out of the way.
export const scriptedDrillAction = (
  table: TableState,
  seatPosition: number,
  targetStreet: BettingStreet,
): Decision => {
  const street = bettingStreetOf(table);
  const preference =
    street === targetStreet && targetStreet === 'preflop'
      ? FOLD_TO_HERO
      : street === targetStreet
        ? ON_TARGET
        : BEFORE_TARGET;
  const legal = getLegalDecisions(table, seatPosition).map(
    ({ decision }) => decision,
  );
  return preference.find((decision) => legal.includes(decision)) ?? legal[0];
};
