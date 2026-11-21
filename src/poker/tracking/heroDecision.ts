import { bettingStreetOf } from '@poker/engine/bettingRules';
import { getSeat, playersInHand } from '@poker/engine/seatOrder';
import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type { Decision, TableState } from '@poker/engine/tableTypes';
import { estimatePotEquity } from '@poker/robots/potEquity';
import { scoreStartingHand } from '@poker/robots/startingHandScore';

import { positionOf } from './tablePosition';
import type { HeroDecisionRecord } from './trackingTypes';

const EQUITY_ITERATIONS = 100;
const MOST_SIMULATED_OPPONENTS = 3;

// Describes the hero's decision using the table as it was just before it.
export const recordHeroDecision = (
  tableBefore: TableState,
  decision: Decision,
  random: () => number,
): HeroDecisionRecord => {
  const hero = getSeat(tableBefore, HERO_SEAT_POSITION);
  const street = bettingStreetOf(tableBefore);
  const contenderCount = playersInHand(tableBefore).length;
  const handStrength =
    street === 'preflop'
      ? scoreStartingHand(hero.holeCards)
      : estimatePotEquity({
          holeCards: hero.holeCards,
          board: tableBefore.board,
          opponentCount: Math.min(contenderCount - 1, MOST_SIMULATED_OPPONENTS),
          iterations: EQUITY_ITERATIONS,
          random,
        });
  return {
    handNumber: tableBefore.handNumber,
    street,
    position: positionOf(tableBefore, HERO_SEAT_POSITION),
    decision,
    amountToCall: tableBefore.currentBet - hero.streetContribution,
    potTotal: tableBefore.seats
      .map((seat) => seat.handContribution)
      .reduce((total, amount) => total + amount, 0),
    handStrength,
    playersInHand: contenderCount,
    isKillHand: tableBefore.killSeat !== null,
  };
};
