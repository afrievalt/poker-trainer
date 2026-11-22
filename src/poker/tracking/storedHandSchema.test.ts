import { describe, expect, test } from 'vitest';

import { parseStoredHands } from './storedHandSchema';

// Firebase drops empty arrays and nulls; early saves have no id.
const STORED_WITHOUT_ID = {
  savedAt: 1000,
  handNumber: 7,
  isDealtIn: true,
  holeCards: [{ rank: 'A', suit: 'S' }],
  netResult: -2,
  sawFlop: false,
  wentToShowdown: false,
  wonAtShowdown: false,
  didScoop: false,
  isKillHand: false,
  isHeroKiller: false,
  voluntarilyPutMoneyIn: true,
  raisedPreflop: false,
  postflopAggressiveActions: 0,
  postflopCalls: 0,
};

describe('parseStoredHands', () => {
  test('fills in what Firebase dropped and skips unusable records', () => {
    const hands = parseStoredHands({
      pushKeyA: STORED_WITHOUT_ID,
      pushKeyB: { handNumber: 'not a hand' },
    });

    expect(hands).toHaveLength(1);
    expect(hands[0]).toMatchObject({
      handId: 'pushKeyA',
      playedAt: 1000,
      position: null,
      board: [],
      decisions: [],
      historyLines: [],
      wonMoney: false,
    });
  });

  test('treats an empty database as no hands', () => {
    expect(parseStoredHands(null)).toEqual([]);
  });

  test('keeps the copy of a hand that has the player note', () => {
    const hands = parseStoredHands({
      older: { ...STORED_WITHOUT_ID, handId: 'same-hand', playerNote: '' },
      newer: {
        ...STORED_WITHOUT_ID,
        handId: 'same-hand',
        playerNote: 'Fold the flop next time.',
      },
    });

    expect(hands).toHaveLength(1);
    expect(hands[0].playerNote).toBe('Fold the flop next time.');
  });
});
