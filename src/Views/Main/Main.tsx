import { useAppSelector } from '@store/hooks';
import { selectActiveScreen } from '@store/slices/navigationSlice';
import type { Screen } from '@store/slices/navigationTypes';
import React from 'react';

import { HiLoTrainer } from './HiLoTrainer/HiLoTrainer';
import { OddsTrainer } from './HiLoTrainer/OddsTrainer/OddsTrainer';
import { PickBestHand } from './HiLoTrainer/PickBestHand/PickBestHand';
import { PlayPoker } from './PlayPoker/PlayPoker';
import { SessionReview } from './SessionReview/SessionReview';

const SCREEN_COMPONENTS: Record<Screen, React.FC> = {
  PlayPoker,
  SessionReview,
  BestPossible: HiLoTrainer,
  BigO: PickBestHand,
  Omaha: PickBestHand,
  OddsOmaha: OddsTrainer,
  OddsBigO: OddsTrainer,
} as const;

const TRAINER_WIDTH = 'max-w-2xl px-0 sm:px-4';

const SCREEN_WIDTHS: Record<Screen, string> = {
  PlayPoker: 'max-w-7xl',
  SessionReview: 'max-w-6xl',
  BestPossible: TRAINER_WIDTH,
  BigO: TRAINER_WIDTH,
  Omaha: TRAINER_WIDTH,
  OddsOmaha: TRAINER_WIDTH,
  OddsBigO: TRAINER_WIDTH,
} as const;

export const Main: React.FC = () => {
  const activeScreen = useAppSelector(selectActiveScreen);
  const ScreenComponent = SCREEN_COMPONENTS[activeScreen];

  return (
    <div className="pb-8">
      <div className={`mx-auto ${SCREEN_WIDTHS[activeScreen]}`}>
        <ScreenComponent />
      </div>
    </div>
  );
};

export default Main;
