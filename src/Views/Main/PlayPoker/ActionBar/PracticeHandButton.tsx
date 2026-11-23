import { LATE_ACE_TWO_DRILL } from '@poker/drills/drillCatalog';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectCanStartDrill } from '@store/slices/drillSelectors';
import { practiceHandStarted } from '@store/slices/drillSlice';
import React from 'react';

export const PracticeHandButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const canStartDrill = useAppSelector(selectCanStartDrill);

  const handlePractice = () =>
    dispatch(practiceHandStarted(LATE_ACE_TWO_DRILL));

  return (
    <button
      type="button"
      onClick={handlePractice}
      className={
        canStartDrill
          ? 'rounded-md bg-sky-500 px-4 py-3 font-bold text-gray-900 hover:bg-sky-400'
          : 'hidden'
      }
    >
      Practice a hand
    </button>
  );
};
