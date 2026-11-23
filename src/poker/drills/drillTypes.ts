import type { BettingStreet, Decision } from '@poker/engine/tableTypes';
import type { Card } from '@poker/evaluation/cards';

export interface DrillPlan {
  title: string;
  heroCards: Card[];
  board: Card[];
  targetStreet: BettingStreet;
  recommended: Decision | null;
  explanation: string;
  shouldOpenTable: boolean;
}

export interface ActiveDrill extends DrillPlan {
  phase: 'scripting' | 'heroDeciding' | 'finished';
}

export interface DrillState {
  active: ActiveDrill | null;
  resultMessage: string;
}
