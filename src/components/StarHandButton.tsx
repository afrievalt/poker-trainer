import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectIsHandStarred } from '@store/slices/handHistorySelectors';
import { handStarToggled } from '@store/slices/handHistorySlice';
import React from 'react';

interface StarHandButtonProps {
  handId: string;
  isCompact?: boolean;
}

const STAR_LABELS = {
  starred: '★ Starred',
  plain: '☆ Star hand',
} as const;

const COMPACT_LABELS = {
  starred: '★',
  plain: '☆',
} as const;

const COLOR_CLASSES = {
  starred: 'bg-amber-400 text-gray-900 hover:bg-amber-300',
  plain: 'bg-gray-200 text-gray-900 hover:bg-gray-100',
} as const;

export const StarHandButton: React.FC<StarHandButtonProps> = ({
  handId,
  isCompact = false,
}) => {
  const dispatch = useAppDispatch();
  const isStarred = useAppSelector((state) =>
    selectIsHandStarred(state, handId),
  );
  const tone = isStarred ? 'starred' : 'plain';
  const label = isCompact ? COMPACT_LABELS[tone] : STAR_LABELS[tone];
  const visibility = handId.length === 0 ? 'hidden' : '';

  const handleToggle = () => dispatch(handStarToggled(handId));

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isStarred}
      className={`rounded-md px-2 py-1 text-sm font-bold ${COLOR_CLASSES[tone]} ${visibility}`}
    >
      {label}
    </button>
  );
};
