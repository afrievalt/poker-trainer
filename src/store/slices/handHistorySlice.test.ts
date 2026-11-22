import type { CompletedHand } from '@poker/tracking/trackingTypes';
import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, test } from 'vitest';

import handHistoryReducer, { handCompleted } from './handHistorySlice';
import { playerActed } from './pokerTableSlice';

const completedHand = {
  handNumber: 1,
  isDealtIn: true,
  position: 'late',
  holeCards: [],
  board: [],
  netResult: 0,
  sawFlop: true,
  wentToShowdown: false,
  wonAtShowdown: false,
  wonMoney: false,
  didScoop: false,
  isKillHand: false,
  isHeroKiller: false,
  voluntarilyPutMoneyIn: true,
  raisedPreflop: false,
  postflopAggressiveActions: 0,
  postflopCalls: 0,
  historyLines: [],
  handId: 'hand-1',
  playedAt: 1,
} satisfies CompletedHand;

describe('handHistory robot notes', () => {
  test('keeps unlikely robot lines with the finished hand', () => {
    const store = configureStore({
      reducer: { handHistory: handHistoryReducer },
    });
    const message =
      'Robot 4 bet the flop into 4 opponents with about 10% of the pot.';

    store.dispatch(
      playerActed({ seatPosition: 4, decision: 'bet', robotNote: message }),
    );
    store.dispatch(playerActed({ seatPosition: 0, decision: 'fold' }));
    store.dispatch(handCompleted(completedHand));

    expect(store.getState().handHistory.hands[0].robotNotes).toEqual([
      { message },
    ]);
  });
});
