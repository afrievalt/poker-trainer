import type { HandRecord } from '@poker/tracking/trackingTypes';
import { describe, expect, test } from 'vitest';

import { buildReviewRequest } from './reviewRequest';

const hand = (overrides: Partial<HandRecord> = {}): HandRecord => ({
  handId: 'hand-1',
  playedAt: 1,
  handNumber: 4,
  isDealtIn: true,
  position: 'late',
  holeCards: [
    { rank: 'A', suit: 'S' },
    { rank: '2', suit: 'S' },
    { rank: '3', suit: 'H' },
    { rank: 'K', suit: 'D' },
    { rank: 'Q', suit: 'C' },
  ],
  board: [
    { rank: '4', suit: 'D' },
    { rank: '5', suit: 'H' },
    { rank: '8', suit: 'C' },
    { rank: 'K', suit: 'C' },
    { rank: 'J', suit: 'D' },
  ],
  netResult: -2,
  sawFlop: true,
  wentToShowdown: true,
  wonAtShowdown: false,
  wonMoney: false,
  didScoop: false,
  isKillHand: false,
  isHeroKiller: false,
  voluntarilyPutMoneyIn: true,
  raisedPreflop: false,
  postflopAggressiveActions: 0,
  postflopCalls: 1,
  historyLines: [
    '— Preflop —',
    'You call $2',
    '— Showdown: 4♦ 5♥ 8♣ K♣ J♦ —',
    'Robot 3 shows A♥ 2♥ 7♦ 9♠ T♣',
  ],
  decisions: [
    {
      handNumber: 4,
      street: 'preflop',
      position: 'late',
      decision: 'call',
      amountToCall: 2,
      potTotal: 3,
      handStrength: 0.7,
      playersInHand: 4,
      isKillHand: false,
    },
  ],
  robotNotes: [],
  playerNote: 'I wanted the nut low.',
  isStarred: false,
  ...overrides,
});

describe('buildReviewRequest', () => {
  test('puts the hero note and hidden cards in separate sections', () => {
    const request = buildReviewRequest(hand());

    expect(request).toContain("Hero's own note:");
    expect(request).toContain('I wanted the nut low.');
    expect(request.indexOf('At the time:')).toBeLessThan(
      request.indexOf('Robot 3 shows'),
    );
    const atTheTime = request.slice(
      request.indexOf('At the time:'),
      request.indexOf('Hindsight:'),
    );
    expect(request.indexOf('Hindsight:')).toBeLessThan(
      request.indexOf('Robot 3 shows'),
    );
    expect(atTheTime).toContain('Board: no board yet');
    expect(atTheTime).not.toContain('Robot 3 shows');
  });

  test('says when the hero left no note and no flag applies', () => {
    const request = buildReviewRequest(hand({ playerNote: '' }));

    expect(request).toContain('The hero did not write a note.');
    expect(request).toContain('- None.');
  });
});
