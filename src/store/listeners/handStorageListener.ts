import { saveHandRecord } from '@utils/handStorage';

import { handCompleted } from '../slices/handHistorySlice';

import { startTableListening } from './tableListener';

// Saves each finished hand to Firebase for signed-in players.
export const listenForHandStorage = (): void => {
  startTableListening({
    actionCreator: handCompleted,
    effect: (_action, listenerApi) => {
      const hand = listenerApi.getState().handHistory.hands.at(-1);
      if (!hand) {
        return;
      }
      saveHandRecord(hand).catch((error: unknown) => {
        console.error('Failed to save the hand', error);
      });
    },
  });
};
