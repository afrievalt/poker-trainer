import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type { RootState } from '@store/store';

export const selectIsDrillScripting = (state: RootState): boolean =>
  state.drill.active?.phase === 'scripting';

export const selectDrillResultMessage = (state: RootState): string =>
  state.drill.resultMessage;

export const selectCanStartDrill = (state: RootState): boolean => {
  const { seats, street } = state.pokerTable;
  const hero = seats.find((seat) => seat.seatPosition === HERO_SEAT_POSITION);
  const isBetweenHands = street === 'waiting' || street === 'complete';
  const canDeal = isBetweenHands && (hero?.stack ?? 0) > 0;
  return canDeal && !state.handReplay.isReplaying;
};
