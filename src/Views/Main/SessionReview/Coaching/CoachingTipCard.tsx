import { useAppSelector } from '@store/hooks';
import { selectCoachingTips } from '@store/slices/coachingSelectors';
import React from 'react';

import { ExampleHandButton } from './ExampleHandButton';

interface CoachingTipCardProps {
  title: string;
}

export const CoachingTipCard: React.FC<CoachingTipCardProps> = ({ title }) => {
  const coachingTip = useAppSelector(selectCoachingTips).find(
    (candidate) => candidate.title === title,
  );
  const exampleHands = coachingTip?.exampleHands ?? [];

  return (
    <article className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-3">
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-800">{coachingTip?.evidence}</p>
      <p className="mt-1 text-sm text-gray-900">{coachingTip?.advice}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {exampleHands.map(({ handId, label }) => (
          <ExampleHandButton key={handId} handId={handId} label={label} />
        ))}
      </div>
    </article>
  );
};
