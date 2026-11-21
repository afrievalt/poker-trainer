import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectHasStoredHands } from '@store/slices/handHistorySelectors';
import { menuItemChosen } from '@store/slices/navigationSlice';
import React from 'react';

import { CoachingPanel } from './Coaching/CoachingPanel';
import { HandList } from './HandList';
import { HandReplay } from './HandReplay/HandReplay';
import { StatsSection } from './StatsSection';

export const SessionReview: React.FC = () => {
  const dispatch = useAppDispatch();
  const hasStoredHands = useAppSelector(selectHasStoredHands);

  const handleBackToTable = () => dispatch(menuItemChosen('PlayPoker'));

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-[18rem_1fr]">
      <aside className="flex flex-col gap-4">
        <button
          onClick={handleBackToTable}
          className="rounded-md bg-amber-500 px-4 py-2 font-bold text-gray-900 hover:bg-amber-400"
        >
          Back to the table
        </button>
        <StatsSection title="This session" />
        {hasStoredHands && <StatsSection title="All saved hands" isAllTime />}
        <HandList />
      </aside>
      <main className="flex flex-col gap-4">
        <CoachingPanel />
        <HandReplay />
      </main>
    </div>
  );
};
