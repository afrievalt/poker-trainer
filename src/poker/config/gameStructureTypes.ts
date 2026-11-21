export type PokerVariant = 'BigO';

export type BettingType = 'fixedLimit';

export type KillTrigger = 'scoop';

export interface StreetBetSizes {
  preflop: number;
  flop: number;
  turn: number;
  river: number;
}

export interface Blinds {
  small: number;
  big: number;
}

export interface KillRule {
  trigger: KillTrigger;
  minimumPot: number;
  bringIn: number;
  isPostedByWinner: boolean;
  isRepeatable: boolean;
  betSizes: StreetBetSizes;
}

export interface RakeStep {
  potAtLeast: number;
  amount: number;
}

export interface GameStructure {
  title: string;
  seatCount: number;
  isButtonSittingOut: boolean;
  variant: PokerVariant;
  bettingType: BettingType;
  startingStack: number;
  smallestChip: number;
  rakeSteps: RakeStep[];
  isRebuyAnyAmount: boolean;
  blinds: Blinds;
  betSizes: StreetBetSizes;
  raisesPerStreet: number;
  isCapLiftedHeadsUp: boolean;
  kill: KillRule;
}
