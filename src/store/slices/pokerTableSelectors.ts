import { getLegalDecisions } from '@poker/engine/bettingRules';
import { getSeat } from '@poker/engine/seatOrder';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type { LegalDecision, TableState } from '@poker/engine/tableTypes';
import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../store';

export const selectPokerTable = (state: RootState): TableState =>
  state.pokerTable;

export const selectActingSeat = (state: RootState): number | null =>
  state.pokerTable.actingSeat;

export const selectIsKillHand = (state: RootState): boolean =>
  state.pokerTable.killSeat !== null;

export const selectPotTotal = createSelector(
  [selectPokerTable],
  (table): number =>
    table.seats.reduce((total, seat) => total + seat.handContribution, 0),
);

export const selectActingSeatDecisions = createSelector(
  [selectPokerTable],
  (table): LegalDecision[] =>
    table.actingSeat === null ? [] : getLegalDecisions(table, table.actingSeat),
);

export const selectHeroDecisions = createSelector(
  [selectPokerTable, selectActingSeatDecisions],
  (table, decisions): LegalDecision[] => {
    const heroSeat = table.seats.find((seat) => seat.isHero);
    return heroSeat?.seatPosition === table.actingSeat ? decisions : [];
  },
);

export const selectRobotToAct = (state: RootState): number | null => {
  const { actingSeat, seats } = state.pokerTable;
  const actingPlayer = seats.find((seat) => seat.seatPosition === actingSeat);
  return actingPlayer && !actingPlayer.isHero
    ? actingPlayer.seatPosition
    : null;
};

// True once the hero is out of the hand without having seen a flop.
export const selectIsHeroSkippingHand = (state: RootState): boolean => {
  const table = state.pokerTable;
  const hero = getSeat(table, HERO_SEAT_POSITION);
  const heroFold = table.actionHistory.find(
    (record) =>
      record.seatPosition === HERO_SEAT_POSITION && record.decision === 'fold',
  );
  const isHandDealt = table.street !== 'waiting';
  return isHandDealt && (!hero.isDealtIn || heroFold?.street === 'preflop');
};

export const selectShouldAutoDeal = (state: RootState): boolean =>
  state.pokerTable.street === 'complete' &&
  selectIsHeroSkippingHand(state) &&
  getSeat(state.pokerTable, HERO_SEAT_POSITION).stack > 0;
