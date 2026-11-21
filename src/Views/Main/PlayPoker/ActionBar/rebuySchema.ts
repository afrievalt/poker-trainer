import { DEFAULT_GAME_STRUCTURE } from '@poker/config/gameStructures';
import { formatMoney } from '@poker/display/money';
import { z } from 'zod';

export interface RebuyFormValues {
  amount: number;
}

const { smallestChip } = DEFAULT_GAME_STRUCTURE;

export const REBUY_STEP = smallestChip;

export const rebuyAmountSchema = z
  .number({ message: 'Enter a dollar amount' })
  .positive(`Rebuy at least ${formatMoney(smallestChip)}`)
  .multipleOf(smallestChip, `Use steps of ${formatMoney(smallestChip)}`);

export const validateRebuyAmount = (amount: number): true | string => {
  const result = rebuyAmountSchema.safeParse(amount);
  return result.success || (result.error.issues[0]?.message ?? 'Invalid');
};
