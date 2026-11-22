import { UnlikelyLineNotes } from '@components/UnlikelyLineNotes';
import { useAppSelector } from '@store/hooks';
import { selectHandReplayView } from '@store/slices/handHistorySelectors';
import React from 'react';

import { CardRow } from './CardRow';
import { DecisionList } from './DecisionList';
import { HandNoteForm } from './HandNoteForm';
import { TextList } from './TextList';

export const HandReplay: React.FC = () => {
  const replay = useAppSelector(selectHandReplayView);

  return (
    <section className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow">
      <header className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{replay.title}</h2>
        <span className="text-xl font-bold text-gray-900">
          {replay.resultText}
        </span>
      </header>
      <div className="flex flex-wrap gap-6">
        <CardRow title="Your cards" cards={replay.holeCards} />
        <CardRow title="Board" cards={replay.board} />
      </div>
      <HandNoteForm />
      <DecisionList />
      <UnlikelyLineNotes isReviewedHand />
      <TextList title="Hand history" lines={replay.historyLines} />
    </section>
  );
};
