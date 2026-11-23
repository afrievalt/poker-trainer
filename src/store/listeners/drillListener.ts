import { buildDrillDeck } from '@poker/drills/drillDeck';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import { isAnyOf } from '@reduxjs/toolkit';
import { menuItemChosen } from '@store/slices/navigationSlice';

import { nextHandChosen, practiceHandStarted } from '../slices/drillSlice';
import { drillMissed } from '../slices/drillSlice';
import { handStarted, playerActed } from '../slices/pokerTableSlice';

import {
  advanceScript,
  gradeHeroDecision,
  isBetweenHands,
} from './advanceDrillScript';
import { startTableListening } from './tableListener';

let isListening = false;

export const listenForDrills = (): void => {
  if (isListening) {
    return;
  }
  isListening = true;

  startTableListening({
    actionCreator: nextHandChosen,
    effect: (_action, listenerApi) => {
      listenerApi.dispatch(handStarted());
    },
  });

  startTableListening({
    actionCreator: practiceHandStarted,
    effect: (action, listenerApi) => {
      const table = listenerApi.getState().pokerTable;
      const hero = table.seats.find(
        (seat) => seat.seatPosition === HERO_SEAT_POSITION,
      );
      if (!isBetweenHands(table.street) || !hero || hero.stack <= 0) {
        listenerApi.dispatch(drillMissed());
        return;
      }
      listenerApi.dispatch(
        handStarted(
          buildDrillDeck(table, action.payload.heroCards, action.payload.board),
          HERO_SEAT_POSITION,
        ),
      );
      if (action.payload.shouldOpenTable) {
        listenerApi.dispatch(menuItemChosen('PlayPoker'));
      }
    },
  });

  startTableListening({
    matcher: isAnyOf(handStarted, playerActed),
    effect: (action, listenerApi) => {
      const drill = listenerApi.getState().drill.active;
      if (!drill || drill.phase === 'finished') {
        return;
      }
      if (gradeHeroDecision(action, drill.phase, listenerApi.dispatch)) {
        return;
      }
      advanceScript(
        listenerApi.getState().pokerTable,
        drill,
        listenerApi.dispatch,
      );
    },
  });
};
