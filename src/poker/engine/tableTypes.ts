import type { GameStructure } from '@poker/config/gameStructureTypes';
import type { Card } from '@poker/evaluation/cards';
import type { RobotStyle } from '@poker/robots/robotTypes';

export type BettingStreet = 'preflop' | 'flop' | 'turn' | 'river';

export type TableStreet = 'waiting' | BettingStreet | 'complete';

export type Decision = 'fold' | 'check' | 'call' | 'bet' | 'raise';

export type PotShare = 'high' | 'low' | 'uncontested';

export interface Seat {
  seatPosition: number;
  playerName: string;
  isHero: boolean;
  robotStyle: RobotStyle | null;
  stack: number;
  holeCards: Card[];
  isDealtIn: boolean;
  hasFolded: boolean;
  hasActed: boolean;
  streetContribution: number;
  handContribution: number;
}

export interface ActionRecord {
  seatPosition: number;
  street: BettingStreet;
  decision: Decision | 'smallBlind' | 'bigBlind' | 'kill';
  amount: number;
  streetTotal: number;
}

export interface PotAward {
  seatPosition: number;
  amount: number;
  share: PotShare;
}

export interface HandResult {
  awards: PotAward[];
  returnedAmount: number;
  returnedTo: number | null;
  potTotal: number;
  rake: number;
  scooperSeat: number | null;
}

export interface TableState {
  structure: GameStructure;
  seats: Seat[];
  handNumber: number;
  buttonSeat: number;
  street: TableStreet;
  deck: Card[];
  board: Card[];
  actingSeat: number | null;
  currentBet: number;
  raisesThisStreet: number;
  killSeat: number | null;
  pendingKillSeats: number[];
  actionHistory: ActionRecord[];
  lastResult: HandResult | null;
}

export interface LegalDecision {
  decision: Decision;
  amount: number;
}
