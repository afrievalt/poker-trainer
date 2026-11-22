import { useAppSelector } from '@store/hooks';
import {
  selectLastHandUnlikelyLines,
  selectReviewedUnlikelyLines,
} from '@store/slices/robotNoteSelectors';
import React from 'react';

interface UnlikelyLineNotesProps {
  isReviewedHand?: boolean;
}

export const UnlikelyLineNotes: React.FC<UnlikelyLineNotesProps> = ({
  isReviewedHand = false,
}) => {
  const notes = useAppSelector(
    isReviewedHand ? selectReviewedUnlikelyLines : selectLastHandUnlikelyLines,
  );

  return (
    <section className={notes.length === 0 ? 'hidden' : undefined}>
      <h3 className="mb-1 font-bold text-gray-900">Unlikely lines</h3>
      <ul className="flex flex-col gap-1 text-sm text-sky-950">
        {notes.map((note, noteNumber) => (
          <li
            key={`${noteNumber}-${note}`}
            className="rounded bg-sky-50 px-2 py-1"
          >
            {note}
          </li>
        ))}
      </ul>
    </section>
  );
};
