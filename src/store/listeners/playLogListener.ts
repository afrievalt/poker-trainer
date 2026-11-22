import { appendPlayLog } from '@poker/tracking/appendPlayLog';
import {
  buildHandDealtLog,
  buildHandFinishedLog,
} from '@poker/tracking/playLog';
import { SESSION_ID } from '@poker/tracking/sessionId';

import { selectIsHandReplaying } from '../slices/handReplaySelectors';
import { handStarted, playerActed } from '../slices/pokerTableSlice';

import { startTableListening } from './tableListener';

let isListeningForPlayLog = false;

// Writes the deck at the deal, and every seat's cards when the hand ends.
export const listenForPlayLog = (): void => {
  if (isListeningForPlayLog) {
    return;
  }
  isListeningForPlayLog = true;
  startTableListening({
    actionCreator: handStarted,
    effect: (action, listenerApi) => {
      if (selectIsHandReplaying(listenerApi.getState())) {
        return;
      }
      appendPlayLog(
        buildHandDealtLog(
          listenerApi.getState().pokerTable,
          action.payload.deck,
          SESSION_ID,
        ),
      );
    },
  });

  startTableListening({
    actionCreator: playerActed,
    effect: (_action, listenerApi) => {
      const isNewlyComplete =
        listenerApi.getOriginalState().pokerTable.street !== 'complete' &&
        listenerApi.getState().pokerTable.street === 'complete';
      if (!isNewlyComplete || selectIsHandReplaying(listenerApi.getState())) {
        return;
      }
      appendPlayLog(
        buildHandFinishedLog(
          listenerApi.getState().pokerTable,
          SESSION_ID,
          Date.now(),
        ),
      );
    },
  });
};
