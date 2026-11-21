import { formatMoney } from '@poker/display/money';

import type {
  GameStructure,
  RakeStep,
  StreetBetSizes,
} from './gameStructureTypes';

const formatBetSizes = (betSizes: StreetBetSizes): string =>
  [betSizes.preflop, betSizes.flop, betSizes.turn, betSizes.river]
    .map(formatMoney)
    .join(' / ');

const formatRake = (rakeSteps: RakeStep[]): string =>
  rakeSteps
    .map(
      (rakeStep) =>
        `${formatMoney(rakeStep.amount)} at ${formatMoney(rakeStep.potAtLeast)}`,
    )
    .join(', ');

export const summarizeGameStructure = (structure: GameStructure): string[] => {
  const {
    betSizes,
    blinds,
    isButtonSittingOut,
    isRebuyAnyAmount,
    kill,
    rakeSteps,
    seatCount,
    smallestChip,
    startingStack,
    variant,
  } = structure;
  const buttonNote = isButtonSittingOut ? ' (button sits out)' : '';
  const rebuyNote = isRebuyAnyAmount ? ', rebuy any amount' : '';

  return [
    `${variant} fixed limit, ${seatCount} seats${buttonNote}`,
    `Blinds ${formatMoney(blinds.small)}-${formatMoney(blinds.big)}`,
    `Bets by street: ${formatBetSizes(betSizes)}`,
    `Kill on scoops of ${formatMoney(kill.minimumPot)}+: ${formatMoney(kill.bringIn)} bring-in, bets ${formatBetSizes(kill.betSizes)}`,
    `Rake: ${formatRake(rakeSteps)}`,
    `Smallest chip ${formatMoney(smallestChip)}`,
    `Starting stack ${formatMoney(startingStack)}${rebuyNote}`,
  ];
};
