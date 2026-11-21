import {
  createStartedTable,
  playDecisions,
  stackDeck,
  stackOf,
} from '@poker/testing/tableFixtures';
import { describe, expect, test } from 'vitest';

import { getLegalDecisions } from './bettingRules';
import { applyDecision } from './playerActions';

const DEALT_PLAYER_COUNT = 8;
const CARDS_IN_DECK = 52;
const HOLE_CARD_COUNT = 5;

const createFirstHand = () => createStartedTable(stackDeck([], ''));

describe('startHand', () => {
  test('moves the button, sits it out, and deals five cards to the rest', () => {
    const table = createFirstHand();
    const dealtSeats = table.seats.filter((seat) => seat.isDealtIn);

    expect(table.buttonSeat).toBe(1);
    expect(table.seats[1].isDealtIn).toBe(false);
    expect(dealtSeats).toHaveLength(DEALT_PLAYER_COUNT);
    expect(dealtSeats.every((seat) => seat.holeCards.length === 5)).toBe(true);
    expect(table.deck).toHaveLength(
      CARDS_IN_DECK - DEALT_PLAYER_COUNT * HOLE_CARD_COUNT,
    );
  });

  test('posts the blinds and starts action left of the big blind', () => {
    const table = createFirstHand();

    expect(stackOf(table, 2)).toBe(96);
    expect(stackOf(table, 3)).toBe(95);
    expect(table.currentBet).toBe(2);
    expect(table.actingSeat).toBe(4);
    expect(getLegalDecisions(table, 4)).toEqual([
      { decision: 'fold', amount: 0 },
      { decision: 'call', amount: 2 },
      { decision: 'raise', amount: 4 },
    ]);
  });

  test('ignores decisions made out of turn', () => {
    const table = createFirstHand();
    applyDecision(table, 5, 'call');

    expect(getLegalDecisions(table, 5)).toEqual([]);
    expect(stackOf(table, 5)).toBe(97);
    expect(table.actingSeat).toBe(4);
  });
});

describe('fixed-limit betting', () => {
  test('caps the betting at a bet and three raises', () => {
    const table = createFirstHand();
    playDecisions(table, ['raise', 'raise', 'raise']);

    expect(table.currentBet).toBe(8);
    expect(getLegalDecisions(table, 7)).toEqual([
      { decision: 'fold', amount: 0 },
      { decision: 'call', amount: 8 },
    ]);
  });

  test('lifts the cap when only two players are left', () => {
    const table = createFirstHand();
    playDecisions(table, ['raise', ...Array(6).fill('fold'), 'raise']);
    playDecisions(table, ['raise']);

    expect(table.actingSeat).toBe(3);
    expect(getLegalDecisions(table, 3)).toContainEqual({
      decision: 'raise',
      amount: 4,
    });
  });

  test('gives the big blind the option, then deals the flop', () => {
    const table = createFirstHand();
    playDecisions(table, [...Array(6).fill('call'), 'call']);

    expect(getLegalDecisions(table, 3)).toEqual([
      { decision: 'check', amount: 0 },
      { decision: 'raise', amount: 2 },
    ]);
    playDecisions(table, ['check']);
    expect(table.street).toBe('flop');
    expect(table.board).toHaveLength(3);
    expect(table.actingSeat).toBe(2);
    expect(getLegalDecisions(table, 2)).toContainEqual({
      decision: 'bet',
      amount: 4,
    });
  });

  test('awards the blinds to the big blind when everyone folds', () => {
    const table = createFirstHand();
    playDecisions(table, Array(7).fill('fold'));

    expect(table.street).toBe('complete');
    expect(stackOf(table, 3)).toBe(98);
    expect(stackOf(table, 2)).toBe(96);
    expect(table.lastResult).toEqual({
      awards: [{ seatPosition: 3, amount: 2, share: 'uncontested' }],
      returnedAmount: 1,
      returnedTo: 3,
      potTotal: 2,
      rake: 0,
      scooperSeat: null,
    });
  });
});
