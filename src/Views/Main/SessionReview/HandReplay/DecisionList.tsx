import { useAppSelector } from '@store/hooks';
import { selectReviewedDecisions } from '@store/slices/coachingSelectors';
import React from 'react';

export const DecisionList: React.FC = () => {
  const decisions = useAppSelector(selectReviewedDecisions);

  return (
    <section>
      <h3 className="mb-1 font-bold text-gray-900">Your decisions</h3>
      <ol className="flex flex-col gap-1 text-sm text-gray-800">
        {decisions.map(({ coachNote, text }, decisionNumber) => (
          <li key={`${decisionNumber}-${text}`}>
            <div>{text}</div>
            <div className="font-semibold text-amber-800">{coachNote}</div>
          </li>
        ))}
      </ol>
    </section>
  );
};
