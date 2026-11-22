import { describeActionHistory } from '@poker/display/actionLog';
import { describeDecisionButtons } from '@poker/display/decisionButtons';
import { formatMoney } from '@poker/display/money';
import { describeSeat } from '@poker/display/seatView';
import type { SeatView } from '@poker/display/seatView';
import { getSeat } from '@poker/engine/seatOrder';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../store';

import {
  selectIsHandReplaying,
  selectIsRevealingHoleCards,
} from './handReplaySelectors';
import {
  selectHeroDecisions,
  selectIsHeroSkippingHand,
  selectPokerTable,
  selectPotTotal,
} from './pokerTableSelectors';

export type ActionBarMode =
  | 'dealFirst'
  | 'heroTurn'
  | 'waiting'
  | 'handOver'
  | 'heroBroke'
  | 'skipping'
  | 'replaying';

export const selectActionBarMode = (state: RootState): ActionBarMode => {
  const table = state.pokerTable;
  const hero = getSeat(table, HERO_SEAT_POSITION);
  const isHandOver = table.street === 'waiting' || table.street === 'complete';
  const modeChecks: [ActionBarMode, boolean][] = [
    ['replaying', selectIsHandReplaying(state)],
    ['heroBroke', isHandOver && hero.stack === 0],
    ['skipping', selectIsHeroSkippingHand(state)],
    ['dealFirst', table.street === 'waiting'],
    ['handOver', table.street === 'complete'],
    ['heroTurn', table.actingSeat === HERO_SEAT_POSITION],
  ];
  return modeChecks.find(([, isMatch]) => isMatch)?.[0] ?? 'waiting';
};

export const selectHeroDecisionButtons = createSelector(
  [selectPokerTable, selectHeroDecisions],
  describeDecisionButtons,
);

export const selectWaitingMessage = (state: RootState): string => {
  const { actingSeat } = state.pokerTable;
  return actingSeat === null
    ? 'Dealing…'
    : `${getSeat(state.pokerTable, actingSeat).playerName} is thinking…`;
};

export const selectDealButtonLabel = (state: RootState): string =>
  state.pokerTable.handNumber === 0 ? 'Deal first hand' : 'Deal next hand';

export const selectActionLogLines = createSelector(
  [selectPokerTable],
  describeActionHistory,
);

export const selectSeatPositions = createSelector([selectPokerTable], (table) =>
  table.seats.map((seat) => seat.seatPosition),
);

export const selectSeatView = (
  state: RootState,
  seatPosition: number,
): SeatView =>
  describeSeat(
    state.pokerTable,
    getSeat(state.pokerTable, seatPosition),
    selectIsRevealingHoleCards(state),
  );

export const selectPotLabel = (state: RootState): string =>
  `Pot ${formatMoney(selectPotTotal(state))}`;

export const selectKillBanner = (state: RootState): string => {
  const { killSeat, structure } = state.pokerTable;
  return killSeat === null
    ? ''
    : `KILL POT · ${formatMoney(structure.kill.bringIn)} bring-in`;
};

export const selectHandTitle = (state: RootState): string => {
  const { handNumber, structure } = state.pokerTable;
  const handText = handNumber === 0 ? '' : ` · Hand #${handNumber}`;
  return `${structure.title}${handText}`;
};
