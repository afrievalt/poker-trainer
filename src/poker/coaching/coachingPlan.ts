import type { HandRecord } from '@poker/tracking/trackingTypes';

import type {
  CoachingTip,
  DecisionFlag,
  DecisionFlagKind,
} from './coachingTypes';
import { flagDecision } from './decisionFlags';
import { gatherSessionFacts } from './sessionFacts';
import { STAT_LEAK_RULES } from './statLeaks';

const TOP_TIP_COUNT = 3;
const EXAMPLE_COUNT = 3;
// A stat leak counts as much as this many flagged decisions.
const STAT_LEAK_WEIGHT = 6;

const FLAG_TIPS: Record<DecisionFlagKind, { title: string; advice: string }> = {
  weakStartingHand: {
    title: 'Starting hand selection',
    advice:
      'Fold hands without a nut-low draw (A-2, A-3) or strong high potential. They cost money even when they hit.',
  },
  calledWithoutOdds: {
    title: 'Calling without the odds',
    advice:
      'Before calling, compare the price with your share of the pot. Fold one-way hands facing bets unless the price is small.',
  },
  foldedWithOdds: {
    title: 'Folding with a good price',
    advice:
      'When the pot is big compared with the bet, call with hands that have a real share of it.',
  },
  missedValue: {
    title: 'Missing value with strong hands',
    advice: 'Bet your strong hands. Checking lets weaker hands draw for free.',
  },
  multiwayBluff: {
    title: 'Bluffing into several players',
    advice:
      'Bluffs rarely work against several opponents in Big O. Save your bets for real hands and good draws.',
  },
} as const;

// One flag (or null) per decision. A weak starting hand is flagged once per
// hand, even when the hero puts money in more than once before the flop.
export const flagsByDecision = (hand: HandRecord): (DecisionFlag | null)[] => {
  const flags = hand.decisions.map(flagDecision);
  const firstWeakStart = flags.findIndex(
    (flag) => flag?.kind === 'weakStartingHand',
  );
  return flags.map((flag, decisionOrder) =>
    flag?.kind === 'weakStartingHand' && decisionOrder !== firstWeakStart
      ? null
      : flag,
  );
};

export const flagsForHand = (hand: HandRecord): DecisionFlag[] =>
  flagsByDecision(hand).filter((flag): flag is DecisionFlag => flag !== null);

const flagTips = (hands: HandRecord[]): CoachingTip[] => {
  const handsByKind = new Map<DecisionFlagKind, HandRecord[]>();
  const countsByKind = new Map<DecisionFlagKind, number>();
  for (const hand of hands.toReversed()) {
    for (const flag of flagsForHand(hand)) {
      countsByKind.set(flag.kind, (countsByKind.get(flag.kind) ?? 0) + 1);
      const flaggedHands = handsByKind.get(flag.kind) ?? [];
      handsByKind.set(flag.kind, [...new Set([...flaggedHands, hand])]);
    }
  }
  return [...countsByKind].map(([kind, count]) => ({
    kind,
    ...FLAG_TIPS[kind],
    evidence: `${count} flagged decisions in ${handsByKind.get(kind)?.length ?? 0} hands.`,
    exampleHandIds: (handsByKind.get(kind) ?? [])
      .slice(0, EXAMPLE_COUNT)
      .map((hand) => hand.handId),
    weight: count,
  }));
};

const statTips = (hands: HandRecord[]): CoachingTip[] => {
  const facts = gatherSessionFacts(hands);
  return STAT_LEAK_RULES.flatMap((rule) => {
    const evidence = rule.findEvidence(facts);
    return evidence === null
      ? []
      : [
          {
            kind: rule.kind,
            title: rule.title,
            evidence,
            advice: rule.advice,
            exampleHandIds: rule
              .findExamples(facts)
              .slice(0, EXAMPLE_COUNT)
              .map((hand) => hand.handId),
            weight: STAT_LEAK_WEIGHT,
          },
        ];
  });
};

// The few things most worth working on, biggest first.
export const buildCoachingTips = (hands: HandRecord[]): CoachingTip[] =>
  [...flagTips(hands), ...statTips(hands)]
    .toSorted((left, right) => right.weight - left.weight)
    .slice(0, TOP_TIP_COUNT);
