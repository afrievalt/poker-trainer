import type {
  BettingStreet,
  Decision,
  LegalDecision,
} from '@poker/engine/tableTypes';

import type { RobotPersonality } from './robotTypes';

export interface RobotSituation {
  legalDecisions: LegalDecision[];
  personality: RobotPersonality;
  street: BettingStreet;
  // Preflop: starting-hand score. Later streets: estimated share of the pot.
  handStrength: number;
  playersInHand: number;
  amountToCall: number;
  potTotal: number;
  raisesThisStreet: number;
}

type Desire = 'aggressive' | 'passive' | 'giveUp';

const DESIRE_FALLBACKS: Record<Desire, readonly Decision[]> = {
  aggressive: ['raise', 'bet', 'call', 'check'],
  passive: ['call', 'check'],
  giveUp: ['check', 'fold'],
} as const;

const PREFLOP = {
  basePlayThreshold: 0.45,
  loosenessWeight: 0.35,
  baseRaiseThreshold: 0.75,
  aggressionWeight: 0.25,
  pressurePerRaise: 0.08,
} as const;

const POSTFLOP = {
  baseValueStrength: 1.6,
  aggressionWeight: 0.5,
  strengthPerRaise: 0.3,
  baseCallFactor: 1.3,
  stubbornnessWeight: 0.8,
} as const;

const BLUFF_SHARE = 0.3;

// Heads-up keeps the full bluff rate. Each extra player cuts it.
const isBluff = (
  frequency: number,
  playersInHand: number,
  random: number,
): boolean => random < frequency / Math.max(playersInHand - 1, 1);

const preflopDesire = (situation: RobotSituation, random: number): Desire => {
  const { handStrength, personality, playersInHand, raisesThisStreet } =
    situation;
  const { aggression, bluffFrequency, looseness, stubbornness } = personality;
  const playThreshold =
    PREFLOP.basePlayThreshold - looseness * PREFLOP.loosenessWeight;
  const raiseThreshold =
    PREFLOP.baseRaiseThreshold - aggression * PREFLOP.aggressionWeight;
  const pressure =
    raisesThisStreet * PREFLOP.pressurePerRaise * (1 - stubbornness);
  const wantsBluff = isBluff(
    bluffFrequency * BLUFF_SHARE,
    playersInHand,
    random,
  );
  if (handStrength >= raiseThreshold || wantsBluff) {
    return 'aggressive';
  }
  return handStrength >= playThreshold + pressure ? 'passive' : 'giveUp';
};

// Compares the pot share against a fair share and the price of calling.
const postflopDesire = (situation: RobotSituation, random: number): Desire => {
  const {
    amountToCall,
    handStrength,
    personality,
    playersInHand,
    potTotal,
    raisesThisStreet,
  } = situation;
  const { aggression, bluffFrequency, stubbornness } = personality;
  const relativeStrength = handStrength * playersInHand;
  const valueStrength =
    POSTFLOP.baseValueStrength -
    aggression * POSTFLOP.aggressionWeight +
    raisesThisStreet * POSTFLOP.strengthPerRaise;
  if (
    relativeStrength >= valueStrength ||
    isBluff(bluffFrequency, playersInHand, random)
  ) {
    return 'aggressive';
  }
  if (amountToCall === 0) {
    return 'passive';
  }
  const potOdds = amountToCall / (potTotal + amountToCall);
  const callFactor =
    POSTFLOP.baseCallFactor - stubbornness * POSTFLOP.stubbornnessWeight;
  return handStrength >= potOdds * callFactor ? 'passive' : 'giveUp';
};

export const decideRobotAction = (
  situation: RobotSituation,
  random: number,
): Decision => {
  const desire =
    situation.street === 'preflop'
      ? preflopDesire(situation, random)
      : postflopDesire(situation, random);
  const legal = new Set(
    situation.legalDecisions.map(({ decision }) => decision),
  );
  const preferred = DESIRE_FALLBACKS[desire].find((decision) =>
    legal.has(decision),
  );
  return preferred ?? situation.legalDecisions[0].decision;
};
