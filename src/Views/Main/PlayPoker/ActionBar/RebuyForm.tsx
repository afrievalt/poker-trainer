import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { playerRebought } from '@store/slices/pokerTableSlice';
import { selectRebuyPrompt } from '@store/slices/rebuySelectors';
import React from 'react';
import { useForm } from 'react-hook-form';

import type { RebuyFormValues } from './rebuySchema';
import { REBUY_STEP, validateRebuyAmount } from './rebuySchema';

export const RebuyForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const startingStack = useAppSelector(
    (state) => state.pokerTable.structure.startingStack,
  );
  const rebuyPrompt = useAppSelector(selectRebuyPrompt);
  const { formState, handleSubmit, register } = useForm<RebuyFormValues>({
    defaultValues: { amount: startingStack },
  });

  const handleRebuy = ({ amount }: RebuyFormValues) =>
    dispatch(playerRebought({ seatPosition: HERO_SEAT_POSITION, amount }));

  return (
    <form onSubmit={handleSubmit(handleRebuy)} className="flex items-end gap-3">
      <label className="flex flex-col text-sm font-semibold text-gray-100">
        {rebuyPrompt}
        <input
          type="number"
          step={REBUY_STEP}
          className="mt-1 w-32 rounded-md border-2 border-gray-400 bg-white px-2 py-2 text-lg text-gray-900"
          {...register('amount', {
            valueAsNumber: true,
            validate: validateRebuyAmount,
          })}
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-amber-500 px-6 py-3 font-bold text-gray-900 hover:bg-amber-400"
      >
        Rebuy
      </button>
      <p className="text-sm text-red-300">{formState.errors.amount?.message}</p>
    </form>
  );
};
