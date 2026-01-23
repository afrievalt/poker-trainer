import { useHiLoTrainer } from '@hooks/useHiLoTrainer';

import { FeedbackOverlay } from './FeedbackOverlay';
import { GameControls } from './GameControls';
import { GuessForm } from './GuessForm';
import { HandDisplay } from './HandDisplay';
import { ResultPanel } from './ResultPanel';

export const HiLoTrainer = () => {
  const { isGameActive } = useHiLoTrainer();

  return (
    <section className="relative rounded-md bg-white p-4 shadow-sm">
      <header className="mb-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Omaha Best-Hand Trainer
        </h2>
        <p className="text-sm text-gray-600">
          Choose the best possible high and low hands that can be made with any
          2 hole cards.
        </p>
      </header>
      <GameControls />
      {isGameActive ? (
        <>
          <HandDisplay />
          <GuessForm />
          <ResultPanel />
          <FeedbackOverlay />
        </>
      ) : (
        <ResultPanel />
      )}
    </section>
  );
};
