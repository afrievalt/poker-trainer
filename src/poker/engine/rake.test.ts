import { DEFAULT_GAME_STRUCTURE } from '@poker/config/gameStructures';
import { describe, expect, test } from 'vitest';

import type { Pot } from './pots';
import { rakeForPot, takeRake } from './rake';

const { rakeSteps } = DEFAULT_GAME_STRUCTURE;

describe('rake', () => {
  test('takes $1 at $20 and another $1 at $40', () => {
    expect(rakeForPot(rakeSteps, 19.5)).toBe(0);
    expect(rakeForPot(rakeSteps, 20)).toBe(1);
    expect(rakeForPot(rakeSteps, 39.5)).toBe(1);
    expect(rakeForPot(rakeSteps, 40)).toBe(2);
    expect(rakeForPot(rakeSteps, 200)).toBe(2);
  });

  test('comes out of the main pot first', () => {
    const pots: Pot[] = [
      { amount: 30, eligibleSeats: [2, 3], isUncalled: false },
      { amount: 20, eligibleSeats: [3], isUncalled: false },
    ];

    expect(takeRake(rakeSteps, pots, 50)).toBe(2);
    expect(pots.map((pot) => pot.amount)).toEqual([28, 20]);
  });
});
