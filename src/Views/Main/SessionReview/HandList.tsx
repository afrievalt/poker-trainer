import { useAppSelector } from '@store/hooks';
import { selectHandListItems } from '@store/slices/handHistorySelectors';
import React from 'react';

import { HandListButton } from './HandListButton';

export const HandList: React.FC = () => {
  const handListItems = useAppSelector(selectHandListItems);
  const emptyMessage =
    handListItems.length === 0 ? 'Play a hand to see it here.' : '';

  return (
    <section className="rounded-lg bg-white p-3 shadow">
      <h2 className="mb-2 font-bold text-gray-900">Hands</h2>
      <p className="text-sm text-gray-700">{emptyMessage}</p>
      <ol className="flex max-h-96 flex-col gap-1 overflow-y-auto">
        {handListItems.map((handListItem) => (
          <li key={handListItem.handId}>
            <HandListButton handId={handListItem.handId} />
          </li>
        ))}
      </ol>
    </section>
  );
};
