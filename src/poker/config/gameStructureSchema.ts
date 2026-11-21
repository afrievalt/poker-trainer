import { z } from 'zod';

import type { GameStructure, StreetBetSizes } from './gameStructureTypes';

const chipAmount = z.number().int().positive();

const streetBetSizesSchema: z.ZodType<StreetBetSizes> = z.object({
  preflop: chipAmount,
  flop: chipAmount,
  turn: chipAmount,
  river: chipAmount,
});

export const gameStructureSchema: z.ZodType<GameStructure> = z.object({
  title: z.string().min(1),
  seatCount: z.number().int().min(2),
  isButtonSittingOut: z.boolean(),
  variant: z.literal('BigO'),
  bettingType: z.literal('fixedLimit'),
  startingStack: chipAmount,
  smallestChip: z.number().positive(),
  rakeSteps: z.array(
    z.object({ potAtLeast: chipAmount, amount: z.number().positive() }),
  ),
  isRebuyAnyAmount: z.boolean(),
  blinds: z.object({ small: chipAmount, big: chipAmount }),
  betSizes: streetBetSizesSchema,
  raisesPerStreet: z.number().int().min(1),
  isCapLiftedHeadsUp: z.boolean(),
  kill: z.object({
    trigger: z.literal('scoop'),
    minimumPot: chipAmount,
    bringIn: chipAmount,
    isPostedByWinner: z.boolean(),
    isRepeatable: z.boolean(),
    betSizes: streetBetSizesSchema,
  }),
});
