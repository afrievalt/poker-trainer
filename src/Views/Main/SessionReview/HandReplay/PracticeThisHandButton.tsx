import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectCanStartDrill } from '@store/slices/drillSelectors';
import { practiceHandStarted } from '@store/slices/drillSlice';
import { selectReviewedHand } from '@store/slices/handHistorySelectors';
import React from 'react';

const FULL_HAND = 5;

export const PracticeThisHandButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const hand = useAppSelector(selectReviewedHand);
  const canStartDrill = useAppSelector(selectCanStartDrill);
  const hasFiveCards = hand !== null && hand.holeCards.length === FULL_HAND;
  const canPracticeThisHand = canStartDrill && hasFiveCards;
  const waitMessage =
    hasFiveCards && !canStartDrill
      ? 'Finish the hand at the table, then you can practice this one.'
      : '';

  const handlePractice = () => {
    if (!hand) {
      return;
    }
    dispatch(
      practiceHandStarted({
        title: `Hand #${hand.handNumber} again`,
        heroCards: hand.holeCards,
        board: hand.board,
        targetStreet: hand.decisions[0]?.street ?? 'preflop',
        recommended: null,
        explanation:
          'These are your cards again. Decide, then compare with your note.',
        shouldOpenTable: true,
      }),
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePractice}
        className={
          canPracticeThisHand
            ? 'w-fit rounded-md bg-sky-500 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-sky-400'
            : 'hidden'
        }
      >
        Practice this hand again
      </button>
      <p
        className={
          waitMessage.length === 0 ? 'hidden' : 'text-sm text-gray-700'
        }
      >
        {waitMessage}
      </p>
    </>
  );
};
