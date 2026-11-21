import { useAppSelector } from '@store/hooks';
import { selectLastHandNotes } from '@store/slices/coachingSelectors';
import React from 'react';

export const LastHandNotes: React.FC = () => {
  const notes = useAppSelector(selectLastHandNotes);

  return (
    <ul className="mt-3 flex flex-col gap-1 text-sm text-amber-900">
      {notes.map((note, noteNumber) => (
        <li
          key={`${noteNumber}-${note}`}
          className="rounded bg-amber-50 px-2 py-1"
        >
          {note}
        </li>
      ))}
    </ul>
  );
};
