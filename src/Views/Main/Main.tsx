import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import React from 'react';

import { HiLoTrainer } from './HiLoTrainer/HiLoTrainer';
import { OddsTrainer } from './HiLoTrainer/OddsTrainer/OddsTrainer';
import { PickBestHand } from './HiLoTrainer/PickBestHand/PickBestHand';

export const Main: React.FC = () => {
  const { mode } = useHiLoTrainer();

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-0 sm:px-4">
        {mode === 'BestPossible' ? (
          <HiLoTrainer />
        ) : mode === 'OddsOmaha' || mode === 'OddsBigO' ? (
          <OddsTrainer />
        ) : (
          <PickBestHand />
        )}
      </div>
    </div>
  );
};

export default Main;
