import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, test } from 'vitest';

import type { RootState } from '../store';

import { selectActingSeatDecisions } from './pokerTableSelectors';
import pokerTableReducer, { handStarted, playerActed } from './pokerTableSlice';

const createTestStore = () =>
  configureStore({ reducer: { pokerTable: pokerTableReducer } });

const asRootState = (state: unknown): RootState => state as RootState;

describe('pokerTableSlice', () => {
  test('deals a shuffled hand and records each player action', () => {
    const store = createTestStore();
    store.dispatch(handStarted());

    const decisions = selectActingSeatDecisions(asRootState(store.getState()));
    expect(store.getState().pokerTable.street).toBe('preflop');
    expect(decisions.map(({ decision }) => decision)).toEqual([
      'fold',
      'call',
      'raise',
    ]);

    store.dispatch(playerActed({ seatPosition: 4, decision: 'fold' }));
    expect(store.getState().pokerTable.actingSeat).toBe(5);
  });
});
