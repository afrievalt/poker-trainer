import { getLegalDecisions } from '@poker/engine/bettingRules';
import { getSeat } from '@poker/engine/seatOrder';
import type { Decision, TableState } from '@poker/engine/tableTypes';

import { decideRobotAction } from './robotDecision';
import { ROBOT_PERSONALITIES } from './robotPersonalities';
import { measureSeatStrength } from './seatStrength';
import type { SeatStrength } from './seatStrength';

export interface RobotChoice {
  decision: Decision;
  measured: SeatStrength;
}

// Decides for the robot in a seat using only what it could see at a real
// table: its own cards, the board, and the betting.
export const decideForRobot = (
  table: TableState,
  seatPosition: number,
  random: () => number,
): RobotChoice => {
  const measured = measureSeatStrength(table, seatPosition, random);
  const seat = getSeat(table, seatPosition);
  return {
    decision: decideRobotAction(
      {
        legalDecisions: getLegalDecisions(table, seatPosition),
        personality: ROBOT_PERSONALITIES[seat.robotStyle ?? 'regular'],
        street: measured.street,
        handStrength: measured.handStrength,
        playersInHand: measured.playersInHand,
        amountToCall: measured.amountToCall,
        potTotal: measured.potTotal,
        raisesThisStreet: table.raisesThisStreet,
      },
      random(),
    ),
    measured,
  };
};
