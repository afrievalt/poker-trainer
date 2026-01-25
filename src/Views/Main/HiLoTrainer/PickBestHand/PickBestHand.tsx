import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import { JSX } from 'react';

import { FeedbackOverlay } from '../FeedbackOverlay';
import { GameControls } from '../GameControls';
import { ResultPanel } from '../ResultPanel';

import { CheckAnswerButton } from './CheckAnswerButton';
import { CommunityCardsDisplay } from './CommunityCardsDisplay';
import { PickBestHandHeader } from './PickBestHandHeader';
import { PlayerHandsDisplay } from './PlayerHandsDisplay';

export const PickBestHand = (): JSX.Element => {
  const { isGameActive } = useHiLoTrainer();

  return (
    <section className="relative rounded-md bg-white p-4 shadow-sm">
      <PickBestHandHeader />
      <GameControls />
      {isGameActive ? (
        <>
          <CommunityCardsDisplay />
          <PlayerHandsDisplay />
          <CheckAnswerButton />
        </>
      ) : (
        <ResultPanel />
      )}
      <FeedbackOverlay />
    </section>
  );
};
