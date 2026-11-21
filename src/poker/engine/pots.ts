import { isInHand } from './seatOrder';
import type { Seat, TableState } from './tableTypes';

export interface Pot {
  amount: number;
  eligibleSeats: number[];
  isUncalled: boolean;
}

const isSameEligibility = (left: Pot, right: Pot): boolean =>
  left.isUncalled === right.isUncalled &&
  left.eligibleSeats.join(',') === right.eligibleSeats.join(',');

const addLayer = (pots: Pot[], layer: Pot): void => {
  const lastPot = pots.at(-1);
  const hasNoContender = layer.eligibleSeats.length === 0;
  if (lastPot && (hasNoContender || isSameEligibility(lastPot, layer))) {
    lastPot.amount += layer.amount;
    return;
  }
  pots.push(layer);
};

const layerAmount = (
  contributors: Seat[],
  previousLevel: number,
  level: number,
): number =>
  contributors
    .map(
      (seat) =>
        Math.min(seat.handContribution, level) -
        Math.min(seat.handContribution, previousLevel),
    )
    .reduce((total, amount) => total + amount, 0);

// Splits the money into a main pot and side pots. A layer only one player
// paid into is an uncalled bet that goes back to that player.
export const buildPots = (table: TableState): Pot[] => {
  const contributors = table.seats.filter((seat) => seat.handContribution > 0);
  const levels = [
    ...new Set(contributors.map((seat) => seat.handContribution)),
  ].sort((left, right) => left - right);
  const pots: Pot[] = [];
  let previousLevel = 0;
  for (const level of levels) {
    const layerContributors = contributors.filter(
      (seat) => seat.handContribution >= level,
    );
    const eligibleSeats = layerContributors
      .filter(isInHand)
      .map((seat) => seat.seatPosition);
    addLayer(pots, {
      amount: layerAmount(contributors, previousLevel, level),
      eligibleSeats,
      isUncalled: layerContributors.length === 1 && eligibleSeats.length === 1,
    });
    previousLevel = level;
  }
  return pots;
};
