import { useHiLoTrainer } from '@hooks/useHiLoTrainer';

import { HighGuessRadios } from './HighGuessRadios';
import { LowGuessRadios } from './LowGuessRadios';

export const GuessForm = () => {
  const { highGuess, lowGuess, submitGuess, dealNewHand } = useHiLoTrainer();
  const handleSubmit = (): void => {
    submitGuess();
  };

  const handleDealNewHand = (): void => {
    dealNewHand();
  };

  const isSubmitDisabled = !highGuess || !lowGuess;

  return (
    <div className="mb-4 grid gap-3">
      <HighGuessRadios />
      <LowGuessRadios />
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded bg-indigo-600 px-3 py-1 text-sm text-white"
          onClick={handleSubmit}
          type="button"
          disabled={isSubmitDisabled}
        >
          Check answer
        </button>
        <button
          className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700"
          onClick={handleDealNewHand}
          type="button"
        >
          Deal new hand
        </button>
      </div>
    </div>
  );
};
