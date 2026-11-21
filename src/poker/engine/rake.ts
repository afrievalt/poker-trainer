import type { RakeStep } from '@poker/config/gameStructureTypes';

import type { Pot } from './pots';

export const rakeForPot = (rakeSteps: RakeStep[], potTotal: number): number =>
  rakeSteps
    .filter((rakeStep) => potTotal >= rakeStep.potAtLeast)
    .map((rakeStep) => rakeStep.amount)
    .reduce((total, amount) => total + amount, 0);

// Removes the rake from the pots, main pot first. Returns the rake taken.
export const takeRake = (
  rakeSteps: RakeStep[],
  pots: Pot[],
  potTotal: number,
): number => {
  const rake = rakeForPot(rakeSteps, potTotal);
  let rakeLeft = rake;
  for (const pot of pots) {
    const rakeFromPot = Math.min(rakeLeft, pot.amount);
    pot.amount -= rakeFromPot;
    rakeLeft -= rakeFromPot;
  }
  return rake;
};
