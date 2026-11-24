import type { Card } from '@poker/evaluation/cards';
import { describeHandListItem } from '@poker/tracking/reviewText';
import {
  describeSessionStats,
  formatSignedMoney,
} from '@poker/tracking/sessionStats';
import type { HandRecord } from '@poker/tracking/trackingTypes';
import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../store';

export const selectSessionHands = (state: RootState): HandRecord[] =>
  state.handHistory.hands;

const selectStoredHands = (state: RootState): HandRecord[] =>
  state.handHistory.storedHands;

// Saved hands plus this session's, oldest first, each hand once.
export const selectAllHands = createSelector(
  [selectStoredHands, selectSessionHands],
  (storedHands, sessionHands): HandRecord[] => {
    const handsById = new Map(
      [...storedHands, ...sessionHands].map((hand) => [hand.handId, hand]),
    );
    return [...handsById.values()];
  },
);

export const selectHasStoredHands = (state: RootState): boolean =>
  state.handHistory.storedHands.length > 0;

export const selectSessionStatLines = createSelector(
  [selectSessionHands],
  describeSessionStats,
);

export const selectAllTimeStatLines = createSelector(
  [selectAllHands],
  describeSessionStats,
);

// Newest first, skipping hands the hero sat out.
export const selectHandListItems = createSelector([selectAllHands], (hands) =>
  hands
    .filter((hand) => hand.isDealtIn)
    .map(describeHandListItem)
    .reverse(),
);

export const selectReviewedHand = createSelector(
  [selectAllHands, (state: RootState) => state.handHistory.reviewedHandId],
  (hands, reviewedHandId): HandRecord | null =>
    hands.find((hand) => hand.handId === reviewedHandId) ??
    hands.findLast((hand) => hand.isDealtIn) ??
    null,
);

export const selectReviewedNote = createSelector(
  [selectReviewedHand],
  (hand): { handId: string; playerNote: string } => ({
    handId: hand?.handId ?? '',
    playerNote: hand?.playerNote ?? '',
  }),
);

export const selectLastDealtHandId = createSelector(
  [selectSessionHands],
  (hands): string => hands.findLast((hand) => hand.isDealtIn)?.handId ?? '',
);

export const selectIsHandStarred = (
  state: RootState,
  handId: string,
): boolean =>
  selectAllHands(state).some(
    (hand) => hand.handId === handId && hand.isStarred,
  );

export const selectStarredHandListItems = createSelector(
  [selectHandListItems],
  (handListItems) =>
    handListItems.filter((handListItem) => handListItem.isStarred),
);

export interface HandReplayView {
  handId: string;
  title: string;
  resultText: string;
  holeCards: Card[];
  board: Card[];
  historyLines: string[];
}

const EMPTY_REPLAY: HandReplayView = {
  handId: '',
  title: 'No hands yet',
  resultText: '',
  holeCards: [],
  board: [],
  historyLines: [],
};

export const selectHandReplayView = createSelector(
  [selectReviewedHand],
  (hand): HandReplayView =>
    hand
      ? {
          handId: hand.handId,
          title: `Hand #${hand.handNumber}`,
          resultText: formatSignedMoney(hand.netResult),
          holeCards: hand.holeCards,
          board: hand.board,
          historyLines: hand.historyLines,
        }
      : EMPTY_REPLAY,
);
