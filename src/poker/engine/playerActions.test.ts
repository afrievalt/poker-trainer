import {
  createStartedTable,
  playDecisions,
  stackDeck,
  stackOf,
} from '@poker/testing/tableFixtures';
import { describe, expect, test } from 'vitest';

import { rebuyPlayer } from './playerActions';

const REBUY_AMOUNT = 40;

describe('rebuyPlayer', () => {
  test('adds chips between hands while the player still has money', () => {
    const table = createStartedTable(stackDeck([], ''));
    playDecisions(table, Array(7).fill('fold'));
    const stackBeforeRebuy = stackOf(table, 0);

    rebuyPlayer(table, 0, REBUY_AMOUNT);

    expect(table.street).toBe('complete');
    expect(stackBeforeRebuy).toBeGreaterThan(0);
    expect(stackOf(table, 0)).toBe(stackBeforeRebuy + REBUY_AMOUNT);
  });

  test('ignores a rebuy while the player is still in the hand', () => {
    const table = createStartedTable(stackDeck([], ''));

    rebuyPlayer(table, 0, REBUY_AMOUNT);

    expect(stackOf(table, 0)).toBe(97);
  });
});
