import React from 'react';

import { HiLoTrainer } from './HiLoTrainer/HiLoTrainer';

export const Main: React.FC = () => {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-0 sm:px-4">
        <HiLoTrainer />
      </div>
    </div>
  );
};

export default Main;
