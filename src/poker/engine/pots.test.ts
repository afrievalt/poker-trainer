import { DEFAULT_GAME_STRUCTURE } from '@poker/config/gameStructures';
import { describe, expect, test } from 'vitest';

import { buildPots } from './pots';
import { createTable } from './tableSetup';
import type { TableState } from './tableTypes';

interface ContributionSetup {
  seatPosition: number;
  amount: number;
  hasFolded?: boolean;
}

const tableWithContributions = (setups: ContributionSetup[]): TableState => {
  const table = createTable(DEFAULT_GAME_STRUCTURE);
  for (const { amount, hasFolded = false, seatPosition } of setups) {
    Object.assign(table.seats[seatPosition], {
      isDealtIn: true,
      hasFolded,
      handContribution: amount,
    });
  }
  return table;
};

describe('buildPots', () => {
  test('makes a side pot when a player is all-in for less', () => {
    const table = tableWithContributions([
      { seatPosition: 2, amount: 10 },
      { seatPosition: 3, amount: 20 },
      { seatPosition: 4, amount: 20, hasFolded: true },
    ]);

    expect(buildPots(table)).toEqual([
      { amount: 30, eligibleSeats: [2, 3], isUncalled: false },
      { amount: 20, eligibleSeats: [3], isUncalled: false },
    ]);
  });

  test('returns the part of a bet nobody called', () => {
    const table = tableWithContributions([
      { seatPosition: 2, amount: 10 },
      { seatPosition: 3, amount: 30 },
      { seatPosition: 4, amount: 20 },
    ]);

    expect(buildPots(table)).toEqual([
      { amount: 30, eligibleSeats: [2, 3, 4], isUncalled: false },
      { amount: 20, eligibleSeats: [3, 4], isUncalled: false },
      { amount: 10, eligibleSeats: [3], isUncalled: true },
    ]);
  });
});
