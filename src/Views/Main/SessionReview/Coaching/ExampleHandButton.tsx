import { useAppDispatch } from '@store/hooks';
import { handReviewOpened } from '@store/slices/handHistorySlice';
import React from 'react';

interface ExampleHandButtonProps {
  handId: string;
  label: string;
}

export const ExampleHandButton: React.FC<ExampleHandButtonProps> = ({
  handId,
  label,
}) => {
  const dispatch = useAppDispatch();

  const handleOpen = () => dispatch(handReviewOpened(handId));

  return (
    <button
      onClick={handleOpen}
      className="rounded border border-indigo-300 px-2 py-0.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
    >
      {label}
    </button>
  );
};
