export type DecisionFlagKind =
  | 'weakStartingHand'
  | 'calledWithoutOdds'
  | 'foldedWithOdds'
  | 'missedValue'
  | 'multiwayBluff';

export type StatLeakKind =
  | 'tooManyHands'
  | 'tooFewHands'
  | 'passivePreflop'
  | 'callingDown'
  | 'passivePostflop'
  | 'killPotLosses';

export type LeakKind = DecisionFlagKind | StatLeakKind;

export interface DecisionFlag {
  kind: DecisionFlagKind;
  message: string;
}

// One thing to work on, with the evidence and example hands behind it.
export interface CoachingTip {
  kind: LeakKind;
  title: string;
  evidence: string;
  advice: string;
  exampleHandIds: string[];
  weight: number;
}
