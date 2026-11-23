import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import { appendPlayLog } from '@poker/tracking/appendPlayLog';
import { summarizeHand } from '@poker/tracking/handSummary';
import { recordHeroDecision } from '@poker/tracking/heroDecision';
import { buildDecisionLog } from '@poker/tracking/playLog';
import { SESSION_ID } from '@poker/tracking/sessionId';
import { createListenerMiddleware } from '@reduxjs/toolkit';

import { selectIsDrillScripting } from '../slices/drillSelectors';
import {
  handCompleted,
  heroDecisionRecorded,
} from '../slices/handHistorySlice';
import { selectIsHandReplaying } from '../slices/handReplaySelectors';
import { selectShouldAutoDeal } from '../slices/pokerTableSelectors';
import { handStarted, playerActed } from '../slices/pokerTableSlice';
import type { AppDispatch, RootState } from '../store';

export const ROBOT_THINKING_MILLISECONDS = 700;
export const AUTO_DEAL_PAUSE_MILLISECONDS = 600;

export const tableListener = createListenerMiddleware();

export const startTableListening = tableListener.startListening.withTypes<
  RootState,
  AppDispatch
>();

const isLivePlay = (state: RootState): boolean => !selectIsHandReplaying(state);

// Deals the next hand on its own after a hand the hero sat out.
startTableListening({
  actionCreator: playerActed,
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState();
    if (!selectShouldAutoDeal(state) || selectIsHandReplaying(state)) {
      return;
    }
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(AUTO_DEAL_PAUSE_MILLISECONDS);
    if (selectShouldAutoDeal(listenerApi.getState())) {
      listenerApi.dispatch(handStarted());
    }
  },
});

// Records each hero decision with the table as it was just before it.
startTableListening({
  actionCreator: playerActed,
  effect: (action, listenerApi) => {
    const tableBefore = listenerApi.getOriginalState().pokerTable;
    const isHeroTurn =
      action.payload.seatPosition === HERO_SEAT_POSITION &&
      tableBefore.actingSeat === HERO_SEAT_POSITION;
    if (
      !isHeroTurn ||
      !isLivePlay(listenerApi.getState()) ||
      selectIsDrillScripting(listenerApi.getState())
    ) {
      return;
    }
    const recorded = recordHeroDecision(
      tableBefore,
      action.payload.decision,
      Math.random,
    );
    appendPlayLog(
      buildDecisionLog({
        table: tableBefore,
        seatPosition: HERO_SEAT_POSITION,
        decision: action.payload.decision,
        measured: recorded.measured,
        sessionId: SESSION_ID,
      }),
    );
    listenerApi.dispatch(heroDecisionRecorded(recorded.record));
  },
});

// Records the hand once it finishes.
startTableListening({
  actionCreator: playerActed,
  effect: (_action, listenerApi) => {
    const isNewlyComplete =
      listenerApi.getOriginalState().pokerTable.street !== 'complete' &&
      listenerApi.getState().pokerTable.street === 'complete';
    if (!isNewlyComplete || !isLivePlay(listenerApi.getState())) {
      return;
    }
    const summary = summarizeHand(listenerApi.getState().pokerTable);
    listenerApi.dispatch(
      handCompleted({
        ...summary,
        handId: `${SESSION_ID}-${summary.handNumber}`,
        playedAt: Date.now(),
      }),
    );
  },
});
