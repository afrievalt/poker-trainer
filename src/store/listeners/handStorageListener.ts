import type { HandRecord } from '@poker/tracking/trackingTypes';
import { saveHandRecord } from '@utils/handStorage';

import { handCompleted, handNoteWritten } from '../slices/handHistorySlice';

import { startTableListening } from './tableListener';

const saveHand = (hand: HandRecord | undefined): void => {
  if (!hand) {
    return;
  }
  saveHandRecord(hand).catch((error: unknown) => {
    console.error('Failed to save the hand', error);
  });
};

// Saves each finished hand, and each note, for signed-in players.
export const listenForHandStorage = (): void => {
  startTableListening({
    actionCreator: handCompleted,
    effect: (_action, listenerApi) => {
      saveHand(listenerApi.getState().handHistory.hands.at(-1));
    },
  });

  startTableListening({
    actionCreator: handNoteWritten,
    effect: (action, listenerApi) => {
      const { handHistory } = listenerApi.getState();
      const { handId } = action.payload;
      saveHand(
        handHistory.hands.find((hand) => hand.handId === handId) ??
          handHistory.storedHands.find((hand) => hand.handId === handId),
      );
    },
  });
};
