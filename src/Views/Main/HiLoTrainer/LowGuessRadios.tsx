import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import type { LowHandLabel } from '@poker/evaluation/handConstants';
import type { ChangeEvent } from 'react';

export const LowGuessRadios = () => {
  const { lowGuess, lowOptions, setLowGuess, clearResult } = useHiLoTrainer();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value as LowHandLabel;
    setLowGuess(value);
    clearResult();
  };

  return (
    <fieldset className="grid gap-2 text-sm text-gray-700">
      <legend className="font-semibold text-gray-800">
        Best possible low hand
      </legend>
      <div className="grid gap-1">
        {lowOptions.map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input
              checked={lowGuess === option}
              name="low-hand"
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
