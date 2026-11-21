import { seatsFromButton } from '@poker/engine/seatOrder';
import type { TableState } from '@poker/engine/tableTypes';

import type { TablePosition } from './trackingTypes';

const BLIND_COUNT = 2;
const EARLY_SEATS = 2;
const LATE_SEATS = 2;

// Positions count from the small blind; the button sits out, so the last
// two players dealt in act last after the flop.
export const positionOf = (
  table: TableState,
  seatPosition: number,
): TablePosition => {
  const dealtOrder = seatsFromButton(table)
    .filter((seat) => seat.isDealtIn)
    .map((seat) => seat.seatPosition);
  const order = dealtOrder.indexOf(seatPosition);
  const actingOrder = order - BLIND_COUNT;
  const positionChecks: [TablePosition, boolean][] = [
    ['smallBlind', order === 0],
    ['bigBlind', order === 1],
    ['late', actingOrder >= dealtOrder.length - BLIND_COUNT - LATE_SEATS],
    ['early', actingOrder < EARLY_SEATS],
  ];
  return positionChecks.find(([, isMatch]) => isMatch)?.[0] ?? 'middle';
};
