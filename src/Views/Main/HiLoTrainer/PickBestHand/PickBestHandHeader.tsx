import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import { JSX } from 'react';

export const PickBestHandHeader = (): JSX.Element => {
  const { mode, pickBestHandMode } = useHiLoTrainer();

  const modeLabel = mode === 'BigO' ? 'BigO' : 'Omaha';

  return (
    <header className="mb-3">
      <h2 className="text-lg font-semibold text-gray-900">
        {modeLabel} Pick Best Hand
      </h2>
      <p className="text-sm text-gray-600">
        {pickBestHandMode === 'high'
          ? 'Step 1 — Select the 2 cards that make the best possible high hand.'
          : 'Step 2 — Same hands. Now select the 2 cards that make the best possible low hand.'}
      </p>
    </header>
  );
};
