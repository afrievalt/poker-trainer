import type { Decision } from '@poker/engine/tableTypes';
import {
  createStartedTable,
  playDecisions,
  stackDeck,
} from '@poker/testing/tableFixtures';
import { describe, expect, test } from 'vitest';

import { describeActionHistory } from './actionLog';
import { describePlayer } from './playerPhrase';
import { describeSeat } from './seatView';

const BOARD = '4D 5H 8C KC JD';
const OTHERS_FOLD: Decision[] = Array(6).fill('fold');
const CHECK_DOWN: Decision[] = [
  'call',
  ...OTHERS_FOLD,
  'check',
  ...Array(6).fill('check'),
];

const playSplitPot = () => {
  const table = createStartedTable(
    stackDeck([null, 'KS KH 9D 9C TS', 'AS 2S 3H KD QC'], BOARD),
  );
  playDecisions(table, CHECK_DOWN);
  return table;
};

describe('describeActionHistory', () => {
  test('describes blinds, streets, the showdown, and the winners', () => {
    const lines = describeActionHistory(playSplitPot());

    expect(lines.slice(0, 4)).toEqual([
      '— Preflop —',
      'Robot 2 posts small blind $1',
      'Robot 3 posts big blind $2',
      'Robot 4 calls $2',
    ]);
    expect(lines).toContain('— Flop: 4♦ 5♥ 8♣ —');
    expect(lines.slice(-2)).toEqual([
      'Robot 3 wins $2.50 (high, Three of a Kind)',
      'Robot 4 wins $2.50 (low)',
    ]);
  });
});

describe('describeSeat', () => {
  test('shows showdown cards and winnings, and hides folded robots', () => {
    const table = playSplitPot();
    const winner = describeSeat(table, table.seats[3]);
    const folded = describeSeat(table, table.seats[5]);

    expect(winner.isFaceUp).toBe(true);
    expect(winner.badgeLabel).toBe('Wins $2.50');
    expect(winner.status).toBe('winner');
    expect(folded.holeCards).toEqual([]);
    expect(folded.status).toBe('folded');
    expect(describeSeat(table, table.seats[1]).status).toBe('sittingOut');
  });
});

describe('describePlayer', () => {
  test('uses "you" verb forms for the hero', () => {
    const table = playSplitPot();
    const phrase = 'scooped $64 and owes a $6 kill';

    expect(describePlayer(table.seats[0], phrase)).toBe(
      'You scooped $64 and owe a $6 kill',
    );
    expect(describePlayer(table.seats[3], 'shows 5♠')).toBe(
      'Robot 3 shows 5♠',
    );
  });
});
