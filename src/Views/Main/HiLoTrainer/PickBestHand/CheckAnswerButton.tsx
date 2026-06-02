import { useHiLoActions } from '@hooks/useHiLoActions';
import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import { JSX } from 'react';

export const CheckAnswerButton = (): JSX.Element => {
  const { revealAnswer, pickBestHandMode } = useHiLoTrainer();
  const { onCheckPickAnswer, onAdvancePhase } = useHiLoActions();

  if (revealAnswer) {
    const label =
      pickBestHandMode === 'high' ? 'Continue to Low Hand' : 'Next Hand';
    return (
      <div className="mt-8 flex justify-center">
        <button
          onClick={onAdvancePhase}
          className="rounded-md bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          {label}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={onCheckPickAnswer}
        className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Check Answer
      </button>
    </div>
  );
};
