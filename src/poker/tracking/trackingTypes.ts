import type { BettingStreet, Decision } from '@poker/engine/tableTypes';
import type { Card } from '@poker/evaluation/cards';

export type TablePosition =
  | 'smallBlind'
  | 'bigBlind'
  | 'early'
  | 'middle'
  | 'late';

// One hero decision with what the hero knew when making it.
export interface HeroDecisionRecord {
  handNumber: number;
  street: BettingStreet;
  position: TablePosition;
  decision: Decision;
  amountToCall: number;
  potTotal: number;
  // Preflop: starting-hand score (0-1). Later: estimated share of the pot.
  handStrength: number;
  playersInHand: number;
  isKillHand: boolean;
}

// Facts about a finished hand, read off the table when it ends.
export interface HandSummary {
  handNumber: number;
  isDealtIn: boolean;
  position: TablePosition | null;
  holeCards: Card[];
  board: Card[];
  netResult: number;
  sawFlop: boolean;
  wentToShowdown: boolean;
  wonAtShowdown: boolean;
  wonMoney: boolean;
  didScoop: boolean;
  isKillHand: boolean;
  isHeroKiller: boolean;
  voluntarilyPutMoneyIn: boolean;
  raisedPreflop: boolean;
  postflopAggressiveActions: number;
  postflopCalls: number;
  historyLines: string[];
}

// A summary stamped with a unique id, so hands from different sessions
// (which reuse hand numbers) can be told apart.
export interface CompletedHand extends HandSummary {
  handId: string;
  playedAt: number;
}

export interface HandRecord extends CompletedHand {
  decisions: HeroDecisionRecord[];
}
