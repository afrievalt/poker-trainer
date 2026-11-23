import { getSeat } from '@poker/engine/seatOrder';
import type { Decision, TableState } from '@poker/engine/tableTypes';
import { decideForRobot } from '@poker/robots/robotTurn';
import type { SeatStrength } from '@poker/robots/seatStrength';
import { unlikelyRobotNote } from '@poker/robots/unlikelyRobotNote';
import { appendPlayLog } from '@poker/tracking/appendPlayLog';
import { buildDecisionLog } from '@poker/tracking/playLog';
import { SESSION_ID } from '@poker/tracking/sessionId';
import { positionOf } from '@poker/tracking/tablePosition';
import { isAnyOf } from '@reduxjs/toolkit';

import { selectIsDrillScripting } from '../slices/drillSelectors';
import { selectIsHandReplaying } from '../slices/handReplaySelectors';
import {
  selectIsHeroSkippingHand,
  selectRobotToAct,
} from '../slices/pokerTableSelectors';
import { handStarted, playerActed } from '../slices/pokerTableSlice';

import {
  ROBOT_THINKING_MILLISECONDS,
  startTableListening,
} from './tableListener';

let isListeningForRobots = false;

const robotNoteFor = (
  table: TableState,
  seatPosition: number,
  decision: Decision,
  measured: SeatStrength,
): string | undefined => {
  const seat = getSeat(table, seatPosition);
  if (!seat.robotStyle) {
    return undefined;
  }
  return (
    unlikelyRobotNote({
      playerName: seat.playerName,
      robotStyle: seat.robotStyle,
      decision,
      street: measured.street,
      isEarlyPosition: positionOf(table, seatPosition) === 'early',
      handStrength: measured.handStrength,
      playersInHand: measured.playersInHand,
    }) ?? undefined
  );
};

// Whenever a robot is next to act, let it think, then play its decision.
// Robots play instantly once the hero is out without seeing a flop.
export const listenForRobotPlay = (): void => {
  if (isListeningForRobots) {
    return;
  }
  isListeningForRobots = true;
  startTableListening({
    matcher: isAnyOf(handStarted, playerActed),
    effect: async (_action, listenerApi) => {
      listenerApi.cancelActiveListeners();
      const robotSeat = selectRobotToAct(listenerApi.getState());
      if (
        robotSeat === null ||
        selectIsHandReplaying(listenerApi.getState()) ||
        selectIsDrillScripting(listenerApi.getState())
      ) {
        return;
      }
      const isSkipping = selectIsHeroSkippingHand(listenerApi.getState());
      await listenerApi.delay(isSkipping ? 0 : ROBOT_THINKING_MILLISECONDS);
      if (
        selectRobotToAct(listenerApi.getState()) !== robotSeat ||
        selectIsHandReplaying(listenerApi.getState()) ||
        selectIsDrillScripting(listenerApi.getState())
      ) {
        return;
      }
      const table = listenerApi.getState().pokerTable;
      const choice = decideForRobot(table, robotSeat, Math.random);
      appendPlayLog(
        buildDecisionLog({
          table,
          seatPosition: robotSeat,
          decision: choice.decision,
          measured: choice.measured,
          sessionId: SESSION_ID,
        }),
      );
      listenerApi.dispatch(
        playerActed({
          seatPosition: robotSeat,
          decision: choice.decision,
          robotNote: robotNoteFor(
            table,
            robotSeat,
            choice.decision,
            choice.measured,
          ),
        }),
      );
    },
  });
};
