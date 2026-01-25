import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import { JSX } from 'react';

export const PickBestHandHeader = (): JSX.Element => {
  const { mode } = useHiLoTrainer();

  return (
    <header className="mb-3">
      <h2 className="text-lg font-semibold text-gray-900">
        {mode === 'BigO' ? 'BigO' : 'Omaha'} Pick Best Hand
      </h2>
      <p className="text-sm text-gray-600">
        Select the 2 cards from the hand(s) that make the best possible high
        (and low if available).
      </p>
    </header>
  );
};
