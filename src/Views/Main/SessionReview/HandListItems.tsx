import { StarHandButton } from '@components/StarHandButton';
import { useAppSelector } from '@store/hooks';
import {
  selectHandListItems,
  selectStarredHandListItems,
} from '@store/slices/handHistorySelectors';
import React from 'react';

import { HandListButton } from './HandListButton';

interface HandListItemsProps {
  title: string;
  emptyMessage: string;
  isStarredOnly: boolean;
}

export const HandListItems: React.FC<HandListItemsProps> = ({
  title,
  emptyMessage,
  isStarredOnly,
}) => {
  const allHands = useAppSelector(selectHandListItems);
  const starredHands = useAppSelector(selectStarredHandListItems);
  const handListItems = isStarredOnly ? starredHands : allHands;
  const message = handListItems.length === 0 ? emptyMessage : '';

  return (
    <div>
      <h2 className="mb-2 font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-700">{message}</p>
      <ol className="flex max-h-96 flex-col gap-1 overflow-y-auto">
        {handListItems.map((handListItem) => (
          <li key={handListItem.handId} className="flex items-start gap-1">
            <StarHandButton handId={handListItem.handId} isCompact />
            <HandListButton handId={handListItem.handId} />
          </li>
        ))}
      </ol>
    </div>
  );
};
