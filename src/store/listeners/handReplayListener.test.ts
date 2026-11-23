import { getLegalDecisions } from '@poker/engine/bettingRules';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type { Decision, TableState } from '@poker/engine/tableTypes';
import { getCardCode } from '@poker/evaluation/cards';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import drillReducer from '../slices/drillSlice';
import handHistoryReducer from '../slices/handHistorySlice';
import handReplayReducer, {
  handReplayRequested,
} from '../slices/handReplaySlice';
import pokerTableReducer, {
  handStarted,
  playerActed,
} from '../slices/pokerTableSlice';

import { handReplayListener } from './handReplayListener';
import { listenForRobotPlay } from './robotPlayListener';
import { ROBOT_THINKING_MILLISECONDS, tableListener } from './tableListener';

listenForRobotPlay();

const MOST_TURNS = 200;

const createTestStore = () =>
  configureStore({
    reducer: {
      handHistory: handHistoryReducer,
      handReplay: handReplayReducer,
      drill: drillReducer,
      pokerTable: pokerTableReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        handReplayListener.middleware,
        tableListener.middleware,
      ),
  });

type TestStore = ReturnType<typeof createTestStore>;

const stayedIn = (table: TableState): Decision => {
  const decisions = getLegalDecisions(table, HERO_SEAT_POSITION);
  const stay = decisions.find((decision) => decision.decision !== 'fold');
  return stay?.decision ?? 'check';
};

const handSignature = (table: TableState): string =>
  JSON.stringify({
    board: table.board.map(getCardCode),
    handNumber: table.handNumber,
    holeCards: table.seats.map((seat) => seat.holeCards.map(getCardCode)),
    stacks: table.seats.map((seat) => seat.stack),
  });

const playHandToShowdown = async (store: TestStore): Promise<void> => {
  store.dispatch(handStarted());
  for (let turn = 0; turn < MOST_TURNS; turn += 1) {
    const table = store.getState().pokerTable;
    if (table.street === 'complete') {
      return;
    }
    if (table.actingSeat === HERO_SEAT_POSITION) {
      store.dispatch(
        playerActed({
          seatPosition: HERO_SEAT_POSITION,
          decision: stayedIn(table),
        }),
      );
    } else {
      await vi.advanceTimersByTimeAsync(ROBOT_THINKING_MILLISECONDS);
    }
  }
};

describe('handReplayListener', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(null, { status: 204 }))),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  test('plays the finished hand back with the same cards and stacks', async () => {
    const store = createTestStore();
    await playHandToShowdown(store);

    const finished = store.getState();
    const signature = handSignature(finished.pokerTable);
    const savedHands = finished.handHistory.hands.length;
    const recordedActions =
      finished.handReplay.recording?.decisions.length ?? 0;
    expect(finished.pokerTable.street).toBe('complete');
    expect(recordedActions).toBeGreaterThan(0);

    store.dispatch(handReplayRequested());
    expect(store.getState().handReplay.isReplaying).toBe(true);
    expect(store.getState().pokerTable.street).toBe('preflop');

    await vi.advanceTimersByTimeAsync(
      recordedActions * ROBOT_THINKING_MILLISECONDS,
    );

    const replayed = store.getState();
    expect(replayed.handReplay.isReplaying).toBe(false);
    expect(replayed.pokerTable.street).toBe('complete');
    expect(handSignature(replayed.pokerTable)).toBe(signature);
    expect(replayed.handHistory.hands).toHaveLength(savedHands);
  });
});
