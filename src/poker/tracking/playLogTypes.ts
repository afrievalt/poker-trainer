import type { Decision } from '@poker/engine/tableTypes';
import type { RobotStyle } from '@poker/robots/robotTypes';
import type { SeatStrength } from '@poker/robots/seatStrength';

import type { TablePosition } from './trackingTypes';

export interface DecisionLog {
  kind: 'decision';
  sessionId: string;
  handNumber: number;
  actionIndex: number;
  seatPosition: number;
  playerName: string;
  isHero: boolean;
  robotStyle: RobotStyle | null;
  street: SeatStrength['street'];
  position: TablePosition;
  decision: Decision;
  amountToCall: number;
  potTotal: number;
  raisesThisStreet: number;
  playersInHand: number;
  handStrength: number;
  opponentsSimulated: number;
  isKillHand: boolean;
  holeCards: string;
  board: string;
}

export interface HandDealtLog {
  kind: 'handDealt';
  sessionId: string;
  handNumber: number;
  buttonSeat: number;
  killSeat: number | null;
  deck: string;
}

export interface SeatLog {
  seatPosition: number;
  playerName: string;
  isHero: boolean;
  robotStyle: RobotStyle | null;
  isDealtIn: boolean;
  hasFolded: boolean;
  stack: number;
  handContribution: number;
  holeCards: string;
}

export interface HandFinishedLog {
  kind: 'handFinished';
  sessionId: string;
  handNumber: number;
  playedAt: number;
  board: string;
  potTotal: number;
  rake: number;
  seats: SeatLog[];
  historyLines: string[];
}

export type PlayLogEntry = DecisionLog | HandDealtLog | HandFinishedLog;
