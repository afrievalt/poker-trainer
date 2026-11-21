import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, test } from 'vitest';

import hiLoTrainerReducer from './hiLoTrainerSlice';
import navigationReducer, { menuItemChosen } from './navigationSlice';

const createTestStore = () =>
  configureStore({
    reducer: { hiLoTrainer: hiLoTrainerReducer, navigation: navigationReducer },
  });

describe('navigationSlice', () => {
  test('opens on Play Poker by default', () => {
    const store = createTestStore();
    expect(store.getState().navigation.activeScreen).toBe('PlayPoker');
  });

  test('choosing a trainer screen also switches the trainer mode', () => {
    const store = createTestStore();
    store.dispatch(menuItemChosen('OddsBigO'));
    expect(store.getState().navigation.activeScreen).toBe('OddsBigO');
    expect(store.getState().hiLoTrainer.mode).toBe('OddsBigO');
    expect(store.getState().hiLoTrainer.oddsPlayerHands).toHaveLength(5);
  });

  test('choosing Play Poker leaves the trainer mode alone', () => {
    const store = createTestStore();
    store.dispatch(menuItemChosen('Omaha'));
    store.dispatch(menuItemChosen('PlayPoker'));
    expect(store.getState().navigation.activeScreen).toBe('PlayPoker');
    expect(store.getState().hiLoTrainer.mode).toBe('Omaha');
  });
});
