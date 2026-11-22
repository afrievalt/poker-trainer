import { useAppDispatch } from '@store/hooks';
import { handReplayRequested } from '@store/slices/handReplaySlice';
import React from 'react';

export const ReplayHandButton: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleReplay = () => dispatch(handReplayRequested());

  return (
    <button
      onClick={handleReplay}
      className="rounded-md bg-white px-6 py-3 font-bold text-gray-900 hover:bg-gray-200"
    >
      Replay hand
    </button>
  );
};
