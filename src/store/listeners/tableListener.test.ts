import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import drillReducer from '../slices/drillSlice';
import handHistoryReducer from '../slices/handHistorySlice';
import handReplayReducer from '../slices/handReplaySlice';
import pokerTableReducer, {
  handStarted,
  playerActed,
} from '../slices/pokerTableSlice';

import { listenForPlayLog } from './playLogListener';
import { listenForRobotPlay } from './robotPlayListener';
import {
  AUTO_DEAL_PAUSE_MILLISECONDS,
  ROBOT_THINKING_MILLISECONDS,
  tableListener,
} from './tableListener';

listenForPlayLog();
listenForRobotPlay();

const MOST_TURNS = 200;
const FAST_PLAY_SLACK_MILLISECONDS = 100;

const createTestStore = () =>
  configureStore({
    reducer: {
      handHistory: handHistoryReducer,
      handReplay: handReplayReducer,
      drill: drillReducer,
      pokerTable: pokerTableReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(tableListener.middleware),
  });

type TestStore = ReturnType<typeof createTestStore>;

const isWaitingOnRobot = (store: TestStore): boolean => {
  const { actingSeat } = store.getState().pokerTable;
  return actingSeat !== null && actingSeat !== HERO_SEAT_POSITION;
};

const letRobotsThink = async (store: TestStore): Promise<void> => {
  for (let turn = 0; turn < MOST_TURNS && isWaitingOnRobot(store); turn += 1) {
    await vi.advanceTimersByTimeAsync(ROBOT_THINKING_MILLISECONDS);
  }
};

describe('tableListener', () => {
  const fetchMock = vi.fn((_url: string, _init: RequestInit) =>
    Promise.resolve(new Response(null, { status: 204 })),
  );

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  test('robots play until it is the hero turn or the hand ends', async () => {
    const store = createTestStore();
    store.dispatch(handStarted());
    await letRobotsThink(store);

    const { actingSeat, street } = store.getState().pokerTable;
    expect(actingSeat === HERO_SEAT_POSITION || street === 'complete').toBe(
      true,
    );
  });

  test('folding preflop plays the hand out fast and deals the next', async () => {
    const store = createTestStore();
    store.dispatch(handStarted());
    await letRobotsThink(store);
    expect(store.getState().pokerTable.street).toBe('preflop');

    store.dispatch(
      playerActed({ seatPosition: HERO_SEAT_POSITION, decision: 'fold' }),
    );
    // Robots act with no thinking time; timers still tick 1ms per step.
    await vi.advanceTimersByTimeAsync(
      AUTO_DEAL_PAUSE_MILLISECONDS + FAST_PLAY_SLACK_MILLISECONDS,
    );

    expect(store.getState().pokerTable.handNumber).toBe(2);
    const [firstHand] = store.getState().handHistory.hands;
    expect(firstHand.handNumber).toBe(1);
    expect(firstHand.decisions.map(({ decision }) => decision)).toEqual([
      'fold',
    ]);
    expect(firstHand.historyLines).toContain('You fold');
  });

  test('writes a deal, each decision, and every seat when the hand ends', async () => {
    const store = createTestStore();
    store.dispatch(handStarted());
    await letRobotsThink(store);
    store.dispatch(
      playerActed({ seatPosition: HERO_SEAT_POSITION, decision: 'fold' }),
    );
    await vi.advanceTimersByTimeAsync(FAST_PLAY_SLACK_MILLISECONDS);

    const entries = fetchMock.mock.calls.map((call) => {
      const init = call[1];
      return JSON.parse(String(init.body)) as {
        kind: string;
        street?: string;
        playersInHand?: number;
        opponentsSimulated?: number;
        seats?: { isHero: boolean; holeCards: string }[];
      };
    });
    expect(entries.map((entry) => entry.kind)).toContain('handDealt');
    expect(entries.map((entry) => entry.kind)).toContain('decision');
    const finished = entries.find((entry) => entry.kind === 'handFinished');
    const dealtRobot = finished?.seats?.find(
      (seat) => !seat.isHero && seat.holeCards.length > 0,
    );
    const postflop = entries.filter(
      (entry) => entry.kind === 'decision' && entry.street !== 'preflop',
    );
    expect(dealtRobot?.holeCards).toBeTruthy();
    expect(postflop.length).toBeGreaterThan(0);
    expect(
      postflop.every(
        (entry) => entry.opponentsSimulated === (entry.playersInHand ?? 0) - 1,
      ),
    ).toBe(true);
  });
});
