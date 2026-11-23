import type { ActiveDrill } from '@poker/drills/drillTypes';
import { scriptedDrillAction } from '@poker/drills/scriptedAction';
import { bettingStreetOf } from '@poker/engine/bettingRules';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type { TableState } from '@poker/engine/tableTypes';
import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';

import {
  drillDecisionRecorded,
  drillHeroPrompted,
  drillMissed,
} from '../slices/drillSlice';
import { playerActed } from '../slices/pokerTableSlice';

export const isBetweenHands = (street: string): boolean =>
  street === 'waiting' || street === 'complete';

export const gradeHeroDecision = (
  action: UnknownAction,
  phase: ActiveDrill['phase'],
  dispatch: Dispatch,
): boolean => {
  if (
    !playerActed.match(action) ||
    phase !== 'heroDeciding' ||
    action.payload.seatPosition !== HERO_SEAT_POSITION
  ) {
    return false;
  }
  dispatch(drillDecisionRecorded(action.payload.decision));
  return true;
};

export const advanceScript = (
  table: TableState,
  drill: ActiveDrill,
  dispatch: Dispatch,
): void => {
  if (isBetweenHands(table.street)) {
    if (drill.phase === 'scripting') {
      dispatch(drillMissed());
    }
    return;
  }
  const { actingSeat } = table;
  if (actingSeat === null || drill.phase !== 'scripting') {
    return;
  }
  if (
    actingSeat === HERO_SEAT_POSITION &&
    bettingStreetOf(table) === drill.targetStreet
  ) {
    dispatch(drillHeroPrompted());
    return;
  }
  dispatch(
    playerActed({
      seatPosition: actingSeat,
      decision: scriptedDrillAction(table, actingSeat, drill.targetStreet),
    }),
  );
};
