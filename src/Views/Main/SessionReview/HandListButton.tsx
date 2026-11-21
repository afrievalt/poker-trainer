import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  selectHandListItems,
  selectReviewedHand,
} from '@store/slices/handHistorySelectors';
import { handReviewOpened } from '@store/slices/handHistorySlice';
import React from 'react';

interface HandListButtonProps {
  handId: string;
}

const SELECTED_CLASSES: Record<'selected' | 'plain', string> = {
  selected: 'bg-indigo-100 ring-2 ring-indigo-500',
  plain: 'hover:bg-gray-100',
} as const;

export const HandListButton: React.FC<HandListButtonProps> = ({ handId }) => {
  const dispatch = useAppDispatch();
  const handListItem = useAppSelector(selectHandListItems).find(
    (candidate) => candidate.handId === handId,
  );
  const isSelected = useAppSelector(selectReviewedHand)?.handId === handId;
  const selectionClassName =
    SELECTED_CLASSES[isSelected ? 'selected' : 'plain'];

  const handleOpen = () => dispatch(handReviewOpened(handId));

  return (
    <button
      onClick={handleOpen}
      className={`w-full rounded px-2 py-1 text-left text-sm ${selectionClassName}`}
    >
      <span className="flex justify-between font-semibold text-gray-900">
        <span>{handListItem?.title}</span>
        <span>{handListItem?.resultText}</span>
      </span>
      <span className="block text-xs text-gray-600">
        {handListItem?.tagsText}
      </span>
    </button>
  );
};
