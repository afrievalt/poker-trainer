import {
  buildCoachingTips,
  flagsByDecision,
  flagsForHand,
} from '@poker/coaching/coachingPlan';
import { describeDecision } from '@poker/tracking/reviewText';
import { createSelector } from '@reduxjs/toolkit';

import {
  selectAllHands,
  selectReviewedHand,
  selectSessionHands,
} from './handHistorySelectors';

export interface ExampleHandLink {
  handId: string;
  label: string;
}

export interface CoachingTipView {
  title: string;
  evidence: string;
  advice: string;
  exampleHands: ExampleHandLink[];
}

export interface ReviewedDecisionView {
  text: string;
  coachNote: string;
}

const NO_NOTES_MESSAGE = 'No problems spotted in your last hand.';

export const selectCoachingTips = createSelector(
  [selectAllHands],
  (hands): CoachingTipView[] => {
    const handNumbers = new Map(
      hands.map((hand) => [hand.handId, hand.handNumber]),
    );
    return buildCoachingTips(hands).map((tip) => ({
      title: tip.title,
      evidence: tip.evidence,
      advice: tip.advice,
      exampleHands: tip.exampleHandIds.map((handId) => ({
        handId,
        label: `Hand #${handNumbers.get(handId) ?? '?'}`,
      })),
    }));
  },
);

export const selectReviewedDecisions = createSelector(
  [selectReviewedHand],
  (hand): ReviewedDecisionView[] => {
    const flags = hand ? flagsByDecision(hand) : [];
    return (hand?.decisions ?? []).map((decision, decisionOrder) => ({
      text: describeDecision(decision),
      coachNote: flags[decisionOrder]?.message ?? '',
    }));
  },
);

// Coach's notes on the hero's most recent hand this session.
export const selectLastHandNotes = createSelector(
  [selectSessionHands],
  (hands): string[] => {
    const lastHand = hands.findLast((hand) => hand.isDealtIn);
    const notes = lastHand
      ? flagsForHand(lastHand).map((flag) => flag.message)
      : [];
    return notes.length > 0 || !lastHand ? notes : [NO_NOTES_MESSAGE];
  },
);
