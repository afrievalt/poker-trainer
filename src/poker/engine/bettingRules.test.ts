import {
  createStartedTable,
  playDecisions,
  stackDeck,
  stackOf,
} from '@poker/testing/tableFixtures';
import { describe, expect, test } from 'vitest';

import { getLegalDecisions } from './bettingRules';
import { applyDecision } from './playerActions';

const FULL_BET = 4;
const SHORT_STACK = 1;

describe('short-stack bets', () => {
  test('lets a player bet all-in for less than a full bet', () => {
    const table = createStartedTable(stackDeck([], ''));
    playDecisions(table, [...Array(6).fill('call'), 'call', 'check']);
    table.seats[2].stack = SHORT_STACK;

    expect(table.street).toBe('flop');
    expect(getLegalDecisions(table, 2)).toEqual([
      { decision: 'check', amount: 0 },
      { decision: 'bet', amount: SHORT_STACK },
    ]);
    applyDecision(table, 2, 'bet');

    expect(table.currentBet).toBe(SHORT_STACK);
    expect(stackOf(table, 2)).toBe(0);
    expect(getLegalDecisions(table, 3)).toEqual([
      { decision: 'fold', amount: 0 },
      { decision: 'call', amount: SHORT_STACK },
      { decision: 'raise', amount: SHORT_STACK + FULL_BET },
    ]);
  });

  test('a short all-in raise does not let the bettor raise again', () => {
    const table = createStartedTable(stackDeck([], ''));
    playDecisions(table, [...Array(6).fill('call'), 'call', 'check']);
    applyDecision(table, 2, 'bet');
    table.seats[3].stack = 5;
    applyDecision(table, 3, 'raise');
    playDecisions(table, Array(6).fill('fold'));

    expect(table.actingSeat).toBe(2);
    expect(table.currentBet).toBe(5);
    expect(table.raisesThisStreet).toBe(0);
    expect(getLegalDecisions(table, 2).map(({ decision }) => decision)).toEqual(
      ['fold', 'call'],
    );
  });
});
