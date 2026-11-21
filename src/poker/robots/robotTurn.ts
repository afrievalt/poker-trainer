import { bettingStreetOf, getLegalDecisions } from '@poker/engine/bettingRules';
import { getSeat, playersInHand } from '@poker/engine/seatOrder';
import type { Decision, TableState } from '@poker/engine/tableTypes';

import { estimatePotEquity } from './potEquity';
import { decideRobotAction } from './robotDecision';
import { ROBOT_PERSONALITIES } from './robotPersonalities';
import { scoreStartingHand } from './startingHandScore';

const EQUITY_ITERATIONS = 100;
const MOST_SIMULATED_OPPONENTS = 3;

// Decides for the robot in a seat using only what it could see at a real
// table: its own cards, the board, and the betting.
export const decideForRobot = (
  table: TableState,
  seatPosition: number,
  random: () => number,
): Decision => {
  const seat = getSeat(table, seatPosition);
  const street = bettingStreetOf(table);
  const contenderCount = playersInHand(table).length;
  const handStrength =
    street === 'preflop'
      ? scoreStartingHand(seat.holeCards)
      : estimatePotEquity({
          holeCards: seat.holeCards,
          board: table.board,
          opponentCount: Math.min(contenderCount - 1, MOST_SIMULATED_OPPONENTS),
          iterations: EQUITY_ITERATIONS,
          random,
        });
  const potTotal = table.seats
    .map((tableSeat) => tableSeat.handContribution)
    .reduce((total, amount) => total + amount, 0);
  return decideRobotAction(
    {
      legalDecisions: getLegalDecisions(table, seatPosition),
      personality: ROBOT_PERSONALITIES[seat.robotStyle ?? 'regular'],
      street,
      handStrength,
      playersInHand: contenderCount,
      amountToCall: table.currentBet - seat.streetContribution,
      potTotal,
      raisesThisStreet: table.raisesThisStreet,
    },
    random(),
  );
};
