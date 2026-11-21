import type { GameStructure } from '@poker/config/gameStructureTypes';
import { robotStyleForSeat } from '@poker/robots/robotPersonalities';

import type { Seat, TableState } from './tableTypes';

export const HERO_SEAT_POSITION = 0;

const createSeat = (seatPosition: number, startingStack: number): Seat => {
  const isHero = seatPosition === HERO_SEAT_POSITION;
  return {
    seatPosition,
    playerName: isHero ? 'You' : `Robot ${seatPosition}`,
    isHero,
    robotStyle: isHero ? null : robotStyleForSeat(seatPosition),
    stack: startingStack,
    holeCards: [],
    isDealtIn: false,
    hasFolded: false,
    hasActed: false,
    streetContribution: 0,
    handContribution: 0,
  };
};

export const createTable = (structure: GameStructure): TableState => ({
  structure,
  seats: Array.from({ length: structure.seatCount }, (_unused, seatPosition) =>
    createSeat(seatPosition, structure.startingStack),
  ),
  handNumber: 0,
  buttonSeat: HERO_SEAT_POSITION,
  street: 'waiting',
  deck: [],
  board: [],
  actingSeat: null,
  currentBet: 0,
  raisesThisStreet: 0,
  killSeat: null,
  pendingKillSeats: [],
  actionHistory: [],
  lastResult: null,
});
