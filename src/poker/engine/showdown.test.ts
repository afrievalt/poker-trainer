import { DEFAULT_GAME_STRUCTURE } from '@poker/config/gameStructures';
import {
  createStartedTable,
  playDecisions,
  stackDeck,
  stackOf,
} from '@poker/testing/tableFixtures';
import { describe, expect, test } from 'vitest';

import { getLegalDecisions } from './bettingRules';
import { startHand } from './handStart';
import { createTable } from './tableSetup';
import type { Decision } from './tableTypes';

const BOARD = '4D 5H 8C KC JD';
const SET_OF_KINGS = 'KS KH 9D 9C TS';
const PAIR_OF_QUEENS = 'QS QH 9D 9C TS';
const NUT_LOW_WITH_KINGS = 'AS 2S 3H KD QC';
const OTHERS_FOLD: Decision[] = Array(6).fill('fold');

// Deal order is seat 2, 3 (big blind), 4, then the rest.
const dealHeadsUp = (bigBlindHand: string, seatFourHand: string) =>
  createStartedTable(stackDeck([null, bigBlindHand, seatFourHand], BOARD));

const CHECK_DOWN: Decision[] = [
  'call',
  ...OTHERS_FOLD,
  'check',
  ...Array(6).fill('check'),
];

// Seat 4 and the big blind cap it preflop, raise the flop, and bet out.
const BIG_POT: Decision[] = [
  'raise',
  ...OTHERS_FOLD,
  'raise',
  'raise',
  'call',
  'bet',
  'raise',
  'call',
  'bet',
  'call',
  'check',
  'bet',
  'call',
];

describe('showdown', () => {
  test('splits high and low down to the half dollar', () => {
    const table = dealHeadsUp(SET_OF_KINGS, NUT_LOW_WITH_KINGS);
    playDecisions(table, CHECK_DOWN);

    expect(table.street).toBe('complete');
    expect(table.lastResult?.awards).toEqual([
      { seatPosition: 3, amount: 2.5, share: 'high' },
      { seatPosition: 4, amount: 2.5, share: 'low' },
    ]);
    expect(stackOf(table, 3)).toBe(97.5);
    expect(stackOf(table, 4)).toBe(97.5);
    expect(table.pendingKillSeats).toEqual([]);
  });

  test('a small scoop does not start a kill', () => {
    const table = dealHeadsUp(PAIR_OF_QUEENS, NUT_LOW_WITH_KINGS);
    playDecisions(table, CHECK_DOWN);

    expect(table.lastResult?.scooperSeat).toBeNull();
    expect(stackOf(table, 4)).toBe(100);
  });

  test('scooping a pot of $50 or more makes the next hand a kill', () => {
    const table = dealHeadsUp(PAIR_OF_QUEENS, NUT_LOW_WITH_KINGS);
    playDecisions(table, BIG_POT);

    expect(table.lastResult?.potTotal).toBe(65);
    expect(table.lastResult?.rake).toBe(2);
    expect(table.lastResult?.scooperSeat).toBe(4);
    expect(stackOf(table, 4)).toBe(128);
    expect(table.pendingKillSeats).toEqual([4]);
  });

  test('the killer posts $6 and acts last; kill bets apply', () => {
    const table = dealHeadsUp(PAIR_OF_QUEENS, NUT_LOW_WITH_KINGS);
    playDecisions(table, BIG_POT);
    startHand(table, stackDeck([], ''));

    expect(table.buttonSeat).toBe(2);
    expect(table.killSeat).toBe(4);
    expect(table.currentBet).toBe(6);
    expect(stackOf(table, 4)).toBe(122);
    expect(table.actingSeat).toBe(5);
    expect(getLegalDecisions(table, 5)).toEqual([
      { decision: 'fold', amount: 0 },
      { decision: 'call', amount: 6 },
      { decision: 'raise', amount: 12 },
    ]);
  });

  test('runs the board out when a short stack is all-in', () => {
    const table = createTable(DEFAULT_GAME_STRUCTURE);
    table.seats[4].stack = 3;
    startHand(
      table,
      stackDeck([null, SET_OF_KINGS, NUT_LOW_WITH_KINGS], BOARD),
    );

    expect(getLegalDecisions(table, 4)).toEqual([
      { decision: 'fold', amount: 0 },
      { decision: 'call', amount: 2 },
      { decision: 'raise', amount: 3 },
    ]);
    playDecisions(table, ['call', ...OTHERS_FOLD, 'check', 'bet', 'call']);

    expect(table.board).toHaveLength(5);
    expect(table.lastResult).toEqual({
      awards: [
        { seatPosition: 3, amount: 3.5, share: 'high' },
        { seatPosition: 4, amount: 3.5, share: 'low' },
      ],
      returnedAmount: 3,
      returnedTo: 3,
      potTotal: 7,
      rake: 0,
      scooperSeat: null,
    });
    expect(stackOf(table, 4)).toBe(3.5);
  });
});
