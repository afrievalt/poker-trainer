import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import type { HighHandLabel } from '@poker/evaluation/handConstants';
import type { ChangeEvent } from 'react';

import { StraightHighRadios } from './StraightHighRadios';

export const HighGuessRadios = () => {
  const { highGuess, highOptions, setHighGuess, clearResult } =
    useHiLoTrainer();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value as HighHandLabel;
    setHighGuess(value);
    clearResult();
  };

  return (
    <div className="grid gap-3">
      <fieldset className="grid gap-2 text-sm text-gray-700">
        <legend className="font-semibold text-gray-800">
          Best possible Omaha hand
        </legend>
        <div className="grid gap-1">
          {highOptions.map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                checked={highGuess === option}
                name="high-hand"
                onChange={handleChange}
                type="radio"
                value={option}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {highGuess === 'Straight' && <StraightHighRadios />}
    </div>
  );
};
