import { useAppDispatch, useAppSelector } from '@store/hooks';
import { handStarted } from '@store/slices/pokerTableSlice';
import { selectDealButtonLabel } from '@store/slices/pokerTableViewSelectors';
import React from 'react';

export const DealButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const dealButtonLabel = useAppSelector(selectDealButtonLabel);

  const handleDeal = () => dispatch(handStarted());

  return (
    <button
      onClick={handleDeal}
      className="rounded-md bg-amber-500 px-6 py-3 font-bold text-gray-900 hover:bg-amber-400"
    >
      {dealButtonLabel}
    </button>
  );
};
