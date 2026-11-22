import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectIsShowingAllHands } from '@store/slices/handReplaySelectors';
import { allHandsDisplayChosen } from '@store/slices/handReplaySlice';
import React from 'react';

export const ShowHandsCheckbox: React.FC = () => {
  const dispatch = useAppDispatch();
  const isShowingAllHands = useAppSelector(selectIsShowingAllHands);

  const handleShowHands = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      allHandsDisplayChosen({ isShowingAllHands: event.target.checked }),
    );
  };

  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-white">
      <input
        type="checkbox"
        checked={isShowingAllHands}
        onChange={handleShowHands}
        className="h-5 w-5 rounded border-2 border-white accent-amber-400"
      />
      Show hands
    </label>
  );
};
