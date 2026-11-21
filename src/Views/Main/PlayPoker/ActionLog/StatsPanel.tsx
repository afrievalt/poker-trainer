import { StatsTable } from '@components/Stats/StatsTable';
import { useAppDispatch } from '@store/hooks';
import { menuItemChosen } from '@store/slices/navigationSlice';
import React from 'react';

import { LastHandNotes } from './LastHandNotes';

export const StatsPanel: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleReview = () => dispatch(menuItemChosen('SessionReview'));

  return (
    <section className="rounded-lg bg-white p-3 shadow">
      <h2 className="mb-2 font-bold text-gray-900">This session</h2>
      <StatsTable />
      <LastHandNotes />
      <button
        onClick={handleReview}
        className="mt-3 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Review hands
      </button>
    </section>
  );
};
