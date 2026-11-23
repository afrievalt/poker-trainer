import { LATE_ACE_TWO_DRILL } from '@poker/drills/drillCatalog';
import { getLegalDecisions } from '@poker/engine/bettingRules';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import { getCardCode } from '@poker/evaluation/cards';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import drillReducer, {
  nextHandChosen,
  practiceHandStarted,
} from '../slices/drillSlice';
import handHistoryReducer from '../slices/handHistorySlice';
import handReplayReducer from '../slices/handReplaySlice';
import pokerTableReducer, { playerActed } from '../slices/pokerTableSlice';

import { listenForDrills } from './drillListener';
import { tableListener } from './tableListener';

listenForDrills();

const MOST_FOLDS = 20;

const isForcedBet = (
  decision: string,
): decision is 'smallBlind' | 'bigBlind' | 'kill' =>
  decision === 'smallBlind' || decision === 'bigBlind' || decision === 'kill';

const createTestStore = () =>
  configureStore({
    reducer: {
      drill: drillReducer,
      handHistory: handHistoryReducer,
      handReplay: handReplayReducer,
      pokerTable: pokerTableReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(tableListener.middleware),
  });

const foldOut = (store: ReturnType<typeof createTestStore>): void => {
  for (let turn = 0; turn < MOST_FOLDS; turn += 1) {
    const table = store.getState().pokerTable;
    if (table.actingSeat === null) {
      return;
    }
    const legal = getLegalDecisions(table, table.actingSeat).map(
      ({ decision }) => decision,
    );
    const decision = legal.includes('fold') ? 'fold' : legal[0];
    if (!decision) {
      return;
    }
    store.dispatch(
      playerActed({
        seatPosition: table.actingSeat,
        decision,
      }),
    );
  }
};

describe('drill listener', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(null, { status: 204 }))),
    );
  });

  test('folds the field to the hero and then grades the decision', () => {
    const store = createTestStore();
    store.dispatch(practiceHandStarted(LATE_ACE_TWO_DRILL));
    const table = store.getState().pokerTable;
    const hero = table.seats.find(
      (seat) => seat.seatPosition === HERO_SEAT_POSITION,
    );

    expect(table.actingSeat).toBe(HERO_SEAT_POSITION);
    expect(table.street).toBe('preflop');
    expect(hero?.holeCards.map(getCardCode)).toEqual([
      'AS',
      '2S',
      '3H',
      'KD',
      'QC',
    ]);
    expect(
      table.actionHistory
        .filter((action) => !isForcedBet(action.decision))
        .every((action) => action.decision === 'fold'),
    ).toBe(true);

    store.dispatch(
      playerActed({ seatPosition: HERO_SEAT_POSITION, decision: 'fold' }),
    );

    expect(store.getState().drill.resultMessage).toBe(
      'You chose to fold. This drill plays a raise. A double-suited ace-two-three is a raise from late position. It has the nut low draw and a suited ace.',
    );
  });

  test('clears the result when the next hand is dealt by hand', () => {
    const store = createTestStore();
    store.dispatch(practiceHandStarted(LATE_ACE_TWO_DRILL));
    store.dispatch(
      playerActed({ seatPosition: HERO_SEAT_POSITION, decision: 'raise' }),
    );
    foldOut(store);
    expect(store.getState().drill.resultMessage.length).toBeGreaterThan(0);
    expect(store.getState().pokerTable.street).toBe('complete');

    store.dispatch(nextHandChosen());

    expect(store.getState().drill.resultMessage).toBe('');
    expect(store.getState().pokerTable.handNumber).toBe(2);
  });
});
