import { getSeat, isInHand } from '@poker/engine/seatOrder';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';

import type { RootState } from '../store';

import { selectActionBarMode } from './pokerTableViewSelectors';
import type { ActionBarMode } from './pokerTableViewSelectors';

const REBUY_BLOCKED: Record<ActionBarMode, boolean> = {
  dealFirst: false,
  handOver: false,
  heroBroke: true,
  heroTurn: true,
  replaying: true,
  skipping: false,
  waiting: false,
} as const;

export const selectIsRebuyOffered = (state: RootState): boolean => {
  if (REBUY_BLOCKED[selectActionBarMode(state)]) {
    return false;
  }
  const table = state.pokerTable;
  const isBetweenHands =
    table.street === 'waiting' || table.street === 'complete';
  return isBetweenHands || !isInHand(getSeat(table, HERO_SEAT_POSITION));
};

export const selectRebuyPrompt = (state: RootState): string => {
  const heroStack = getSeat(state.pokerTable, HERO_SEAT_POSITION).stack;
  const prompts = {
    broke: 'You are out of chips. Rebuy amount ($)',
    funded: 'Add chips before the next hand ($)',
  } as const;
  return prompts[heroStack === 0 ? 'broke' : 'funded'];
};
