import { useAppSelector } from '@store/hooks';
import { selectCoachingTips } from '@store/slices/coachingSelectors';
import React from 'react';

import { CoachingTipCard } from './CoachingTipCard';

export const CoachingPanel: React.FC = () => {
  const coachingTips = useAppSelector(selectCoachingTips);
  const emptyMessage =
    coachingTips.length === 0
      ? 'Nothing stands out yet. Keep playing; stat-based tips need at least 20 hands.'
      : '';

  return (
    <section className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-2 text-xl font-bold text-gray-900">What to work on</h2>
      <p className="text-sm text-gray-700">{emptyMessage}</p>
      <ol className="flex flex-col gap-3">
        {coachingTips.map((coachingTip) => (
          <li key={coachingTip.title}>
            <CoachingTipCard title={coachingTip.title} />
          </li>
        ))}
      </ol>
    </section>
  );
};
