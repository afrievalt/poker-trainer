import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import React from 'react';

import { HiLoTrainer } from './HiLoTrainer/HiLoTrainer';
import { PickBestHand } from './HiLoTrainer/PickBestHand';

export const Main: React.FC = () => {
  const { mode } = useHiLoTrainer();

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-0 sm:px-4">
        {mode === 'BestPossible' ? <HiLoTrainer /> : <PickBestHand />}
      </div>
    </div>
  );
};

export default Main;
