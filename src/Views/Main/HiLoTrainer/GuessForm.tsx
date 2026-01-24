import { useHiLoTrainer } from '@hooks/useHiLoTrainer';

import { HighGuessRadios } from './HighGuessRadios';
import { LowGuessRadios } from './LowGuessRadios';

export const GuessForm = () => {
  const { highGuess, straightHighGuess, lowGuess, submitGuess, timeLeft } =
    useHiLoTrainer();
  const handleSubmit = (): void => {
    submitGuess();
  };

  const isSubmitDisabled =
    !highGuess ||
    !lowGuess ||
    (highGuess === 'Straight' && !straightHighGuess) ||
    timeLeft <= 0;

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
      </div>
    </div>
  );
};
