import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import { decideForRobot } from '@poker/robots/robotTurn';
import { summarizeHand } from '@poker/tracking/handSummary';
import { recordHeroDecision } from '@poker/tracking/heroDecision';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { generateUUID } from '@utils/uuid';

import {
  handCompleted,
  heroDecisionRecorded,
} from '../slices/handHistorySlice';
import { selectIsHandReplaying } from '../slices/handReplaySelectors';
import {
  selectIsHeroSkippingHand,
  selectRobotToAct,
  selectShouldAutoDeal,
} from '../slices/pokerTableSelectors';
import { handStarted, playerActed } from '../slices/pokerTableSlice';
import type { AppDispatch, RootState } from '../store';

export const ROBOT_THINKING_MILLISECONDS = 700;
export const AUTO_DEAL_PAUSE_MILLISECONDS = 600;

// Identifies this page load, so hand ids stay unique across sessions.
const SESSION_ID = generateUUID();

export const tableListener = createListenerMiddleware();

export const startTableListening = tableListener.startListening.withTypes<
  RootState,
  AppDispatch
>();

// Whenever a robot is next to act, let it think, then play its decision.
// Robots play instantly once the hero is out without seeing a flop.
startTableListening({
  matcher: isAnyOf(handStarted, playerActed),
  effect: async (_action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    const robotSeat = selectRobotToAct(listenerApi.getState());
    if (robotSeat === null || selectIsHandReplaying(listenerApi.getState())) {
      return;
    }
    const isSkipping = selectIsHeroSkippingHand(listenerApi.getState());
    await listenerApi.delay(isSkipping ? 0 : ROBOT_THINKING_MILLISECONDS);
    const decision = decideForRobot(
      listenerApi.getState().pokerTable,
      robotSeat,
      Math.random,
    );
    listenerApi.dispatch(playerActed({ seatPosition: robotSeat, decision }));
  },
});

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
    if (!isHeroTurn || selectIsHandReplaying(listenerApi.getState())) {
      return;
    }
    listenerApi.dispatch(
      heroDecisionRecorded(
        recordHeroDecision(tableBefore, action.payload.decision, Math.random),
      ),
    );
  },
});

// Records the hand once it finishes.
startTableListening({
  actionCreator: playerActed,
  effect: (_action, listenerApi) => {
    const isNewlyComplete =
      listenerApi.getOriginalState().pokerTable.street !== 'complete' &&
      listenerApi.getState().pokerTable.street === 'complete';
    if (isNewlyComplete && !selectIsHandReplaying(listenerApi.getState())) {
      const summary = summarizeHand(listenerApi.getState().pokerTable);
      listenerApi.dispatch(
        handCompleted({
          ...summary,
          handId: `${SESSION_ID}-${summary.handNumber}`,
          playedAt: Date.now(),
        }),
      );
    }
  },
});
