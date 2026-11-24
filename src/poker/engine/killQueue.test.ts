import {
  createStartedTable,
  playDecisions,
  stackDeck,
  stackOf,
} from '@poker/testing/tableFixtures';
import { describe, expect, test } from 'vitest';

import { getLegalDecisions } from './bettingRules';
import { startHand } from './handStart';
import type { Decision } from './tableTypes';

const EVERYONE_FOLDS: Decision[] = Array(7).fill('fold');

// Hand 1 ends with seat 2 (next hand's button) and seat 6 owed kills.
const createTableWithQueuedKills = () => {
  const table = createStartedTable(stackDeck([], ''));
  playDecisions(table, EVERYONE_FOLDS);
  table.pendingKillSeats = [2, 6];
  return table;
};

describe('kill queue', () => {
  test('a scooper on the button keeps the kill for the next hand', () => {
    const table = createTableWithQueuedKills();
    startHand(table, stackDeck([], ''));

    expect(table.buttonSeat).toBe(2);
    expect(table.killSeat).toBeNull();
    expect(table.currentBet).toBe(2);
    expect(table.pendingKillSeats).toEqual([2, 6]);
  });

  test('the kill is posted, and action still starts left of the big blind', () => {
    const table = createTableWithQueuedKills();
    startHand(table, stackDeck([], ''));
    playDecisions(table, EVERYONE_FOLDS);
    startHand(table, stackDeck([], ''));

    expect(table.buttonSeat).toBe(3);
    expect(table.killSeat).toBe(2);
    expect(table.currentBet).toBe(6);
    expect(stackOf(table, 2)).toBe(90);
    expect(table.actingSeat).toBe(6);
    expect(getLegalDecisions(table, 6)).toEqual([
      { decision: 'fold', amount: 0 },
      { decision: 'call', amount: 6 },
      { decision: 'raise', amount: 12 },
    ]);
    expect(table.pendingKillSeats).toEqual([6]);
  });
});
