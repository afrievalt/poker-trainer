import type { HandRecord } from '@poker/tracking/trackingTypes';
import { saveHandRecord } from '@utils/handStorage';

import {
  handCompleted,
  handNoteWritten,
  handStarToggled,
} from '../slices/handHistorySlice';

import { startTableListening } from './tableListener';

const saveHand = (hand: HandRecord | undefined): void => {
  if (!hand) {
    return;
  }
  saveHandRecord(hand).catch((error: unknown) => {
    console.error('Failed to save the hand', error);
  });
};

const findSavedHand = (
  hands: HandRecord[],
  storedHands: HandRecord[],
  handId: string,
): HandRecord | undefined =>
  hands.find((hand) => hand.handId === handId) ??
  storedHands.find((hand) => hand.handId === handId);

// Saves each finished hand, and later notes and stars, for signed-in players.
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
      const { hands, storedHands } = listenerApi.getState().handHistory;
      saveHand(findSavedHand(hands, storedHands, action.payload.handId));
    },
  });

  startTableListening({
    actionCreator: handStarToggled,
    effect: (action, listenerApi) => {
      const { hands, storedHands } = listenerApi.getState().handHistory;
      saveHand(findSavedHand(hands, storedHands, action.payload));
    },
  });
};
