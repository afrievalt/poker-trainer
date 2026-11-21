import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import { STRAIGHT_HIGH_OPTIONS } from '@poker/evaluation/handConstants';
import type { StraightHighLabel } from '@poker/evaluation/handConstants';
import type { ChangeEvent } from 'react';

export const StraightHighRadios = () => {
  const { straightHighGuess, setStraightHighGuess, clearResult } =
    useHiLoTrainer();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value as StraightHighLabel;
    setStraightHighGuess(value);
    clearResult();
  };

  return (
    <fieldset className="grid gap-2 text-sm text-gray-700">
      <legend className="font-semibold text-gray-800">
        Straight high card
      </legend>
      <div className="grid grid-cols-5 gap-1">
        {STRAIGHT_HIGH_OPTIONS.map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input
              checked={straightHighGuess === option}
              name="straight-high"
              onChange={handleChange}
              type="radio"
              value={option}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};
