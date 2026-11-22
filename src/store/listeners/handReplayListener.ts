import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { ListenerEffectAPI } from '@reduxjs/toolkit';
import { ROBOT_THINKING_MILLISECONDS } from '@store/listeners/tableListener';
import { selectIsHandReplaying } from '@store/slices/handReplaySelectors';
import {
  handRecordingBegan,
  handReplayFinished,
  handReplayRequested,
  recordedActionAdded,
} from '@store/slices/handReplaySlice';
import type { HandRecording } from '@store/slices/handReplaySlice';
import {
  handStarted,
  playerActed,
  tableRestored,
} from '@store/slices/pokerTableSlice';

import type { AppDispatch, RootState } from '../store';

export const handReplayListener = createListenerMiddleware();

const startHandReplayListening = handReplayListener.startListening.withTypes<
  RootState,
  AppDispatch
>();

type ReplayApi = ListenerEffectAPI<RootState, AppDispatch>;

const rememberDealtHand = (
  action: { payload: { deck: HandRecording['deck'] } },
  listenerApi: ReplayApi,
): void => {
  if (selectIsHandReplaying(listenerApi.getState())) {
    return;
  }
  listenerApi.dispatch(
    handRecordingBegan({
      tableBefore: listenerApi.getOriginalState().pokerTable,
      deck: action.payload.deck,
    }),
  );
};

const rememberAction = (
  action: { payload: HandRecording['decisions'][number] },
  listenerApi: ReplayApi,
): void => {
  if (selectIsHandReplaying(listenerApi.getState())) {
    return;
  }
  listenerApi.dispatch(recordedActionAdded(action.payload));
};

const playRecordedHand = async (
  listenerApi: ReplayApi,
  recording: HandRecording,
): Promise<void> => {
  listenerApi.dispatch(tableRestored(recording.tableBefore));
  listenerApi.dispatch(handStarted(recording.deck));
  for (const decision of recording.decisions) {
    await listenerApi.delay(ROBOT_THINKING_MILLISECONDS);
    if (!selectIsHandReplaying(listenerApi.getState())) {
      return;
    }
    listenerApi.dispatch(playerActed(decision));
  }
  listenerApi.dispatch(handReplayFinished());
};

startHandReplayListening({
  actionCreator: handStarted,
  effect: rememberDealtHand,
});

startHandReplayListening({
  actionCreator: playerActed,
  effect: rememberAction,
});

startHandReplayListening({
  actionCreator: handReplayRequested,
  effect: async (_action, listenerApi) => {
    const recording = listenerApi.getOriginalState().handReplay.recording;
    if (!recording) {
      return;
    }
    listenerApi.cancelActiveListeners();
    await playRecordedHand(listenerApi, recording);
  },
});
