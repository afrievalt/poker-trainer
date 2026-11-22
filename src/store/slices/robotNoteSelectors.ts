import type { RobotLineNote } from '@poker/tracking/trackingTypes';
import { createSelector } from '@reduxjs/toolkit';

import { selectReviewedHand, selectSessionHands } from './handHistorySelectors';

const messagesOf = (notes: RobotLineNote[] | undefined): string[] =>
  (notes ?? []).map((note) => note.message);

export const selectReviewedUnlikelyLines = createSelector(
  [selectReviewedHand],
  (hand): string[] => messagesOf(hand?.robotNotes),
);

export const selectLastHandUnlikelyLines = createSelector(
  [selectSessionHands],
  (hands): string[] =>
    messagesOf(hands.findLast((hand) => hand.isDealtIn)?.robotNotes),
);
