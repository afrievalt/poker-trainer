import { HERO_SEAT_POSITION } from '@poker/engine/tableSetup';
import type { Decision, TableState } from '@poker/engine/tableTypes';
import { measureSeatStrength } from '@poker/robots/seatStrength';
import type { SeatStrength } from '@poker/robots/seatStrength';

import { positionOf } from './tablePosition';
import type { HeroDecisionRecord } from './trackingTypes';

export interface RecordedHeroDecision {
  record: HeroDecisionRecord;
  measured: SeatStrength;
}

// Describes the hero's decision using the table as it was just before it.
export const recordHeroDecision = (
  tableBefore: TableState,
  decision: Decision,
  random: () => number,
): RecordedHeroDecision => {
  const measured = measureSeatStrength(tableBefore, HERO_SEAT_POSITION, random);
  return {
    measured,
    record: {
      handNumber: tableBefore.handNumber,
      street: measured.street,
      position: positionOf(tableBefore, HERO_SEAT_POSITION),
      decision,
      amountToCall: measured.amountToCall,
      potTotal: measured.potTotal,
      handStrength: measured.handStrength,
      playersInHand: measured.playersInHand,
      isKillHand: tableBefore.killSeat !== null,
    },
  };
};
