import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectReviewedNote } from '@store/slices/handHistorySelectors';
import { handNoteWritten } from '@store/slices/handHistorySlice';
import React from 'react';
import { useForm } from 'react-hook-form';

import type { HandNoteValues } from './handNoteSchema';
import { validatePlayerNote } from './handNoteSchema';

export const HandNoteForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { handId, playerNote } = useAppSelector(selectReviewedNote);
  const { formState, handleSubmit, register } = useForm<HandNoteValues>({
    values: { playerNote },
  });

  const handleSave = ({ playerNote: note }: HandNoteValues) => {
    if (handId.length === 0) {
      return;
    }
    dispatch(handNoteWritten({ handId, playerNote: note.trim() }));
  };

  return (
    <form
      onSubmit={handleSubmit(handleSave)}
      className={handId.length === 0 ? 'hidden' : 'flex flex-col gap-2'}
    >
      <label className="flex flex-col text-sm font-semibold text-gray-900">
        Your note
        <textarea
          rows={2}
          className="mt-1 rounded-md border-2 border-gray-900 bg-white px-2 py-2 text-base text-gray-900"
          {...register('playerNote', { validate: validatePlayerNote })}
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Save note
        </button>
        <p className="text-sm font-semibold text-red-700">
          {formState.errors.playerNote?.message}
        </p>
      </div>
    </form>
  );
};
