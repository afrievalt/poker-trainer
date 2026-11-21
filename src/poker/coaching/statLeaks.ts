import { formatMoney } from '@poker/display/money';
import type { HandRecord } from '@poker/tracking/trackingTypes';

import type { StatLeakKind } from './coachingTypes';
import type { SessionFacts } from './sessionFacts';

const PERCENT = 100;
const MOST_HANDS_PLAYED = 0.4;
const FEWEST_HANDS_PLAYED = 0.15;
const MIN_PLAYED_FOR_RAISE_CHECK = 0.2;
const FEWEST_RAISES_OF_PLAYED = 0.2;
const MOST_SHOWDOWNS = 0.5;
const FEWEST_SHOWDOWN_WINS = 0.45;
const LEAST_AGGRESSION = 0.7;
const AGGRESSION_DIGITS = 1;

export const MIN_HANDS = 20;
const MIN_FLOPS = 10;
const MIN_CALLS = 10;
const MIN_KILL_HANDS = 5;

const percent = (fraction: number): string =>
  `${Math.round(fraction * PERCENT)}%`;

const worstFirst = (hands: HandRecord[]): HandRecord[] =>
  hands.toSorted((left, right) => left.netResult - right.netResult);

export interface StatLeakRule {
  kind: StatLeakKind;
  title: string;
  advice: string;
  // Returns the evidence when the leak shows, otherwise null.
  findEvidence: (facts: SessionFacts) => string | null;
  findExamples: (facts: SessionFacts) => HandRecord[];
}

export const STAT_LEAK_RULES: readonly StatLeakRule[] = [
  {
    kind: 'tooManyHands',
    title: 'Playing too many hands',
    advice:
      'Most Big O hands are trouble. Play hands that can make the nut low (A-2, A-3) or the nut high, and fold the rest, especially early.',
    findEvidence: ({ hands, playedRate }) =>
      hands.length >= MIN_HANDS && playedRate > MOST_HANDS_PLAYED
        ? `You played ${percent(playedRate)} of ${hands.length} hands (aim for about 20–35%).`
        : null,
    findExamples: ({ playedHands }) => worstFirst(playedHands),
  },
  {
    kind: 'tooFewHands',
    title: 'Playing too few hands',
    advice:
      'You may be folding playable hands. A-2 and A-3 hands, especially with a suited ace, are worth playing.',
    findEvidence: ({ hands, playedRate }) =>
      hands.length >= MIN_HANDS && playedRate < FEWEST_HANDS_PLAYED
        ? `You played only ${percent(playedRate)} of ${hands.length} hands.`
        : null,
    findExamples: () => [],
  },
  {
    kind: 'passivePreflop',
    title: 'Not raising good starting hands',
    advice:
      'Raise your best hands (A-2 with a suited ace, A-2-3) to build pots you are likely to scoop.',
    findEvidence: ({ hands, playedRate, raisedShareOfPlayed }) =>
      hands.length >= MIN_HANDS &&
      playedRate >= MIN_PLAYED_FOR_RAISE_CHECK &&
      raisedShareOfPlayed < FEWEST_RAISES_OF_PLAYED
        ? `You raised only ${percent(raisedShareOfPlayed)} of the hands you played.`
        : null,
    findExamples: ({ playedHands }) =>
      playedHands.filter((hand) => !hand.raisedPreflop && hand.wonMoney),
  },
  {
    kind: 'callingDown',
    title: 'Calling down too often',
    advice:
      'Fold more on the turn and river when your hand only covers half the pot (no low, or no strong high).',
    findEvidence: ({ flopHands, showdownRate, showdownWinRate }) =>
      flopHands.length >= MIN_FLOPS &&
      showdownRate > MOST_SHOWDOWNS &&
      showdownWinRate < FEWEST_SHOWDOWN_WINS
        ? `You reached showdown after ${percent(showdownRate)} of flops and won only ${percent(showdownWinRate)} of them.`
        : null,
    findExamples: ({ showdownHands }) =>
      worstFirst(showdownHands.filter((hand) => !hand.wonAtShowdown)),
  },
  {
    kind: 'passivePostflop',
    title: 'Too passive after the flop',
    advice:
      'Bet and raise your strong hands instead of calling; make other players pay to draw.',
    findEvidence: ({ aggression, postflopCalls }) =>
      postflopCalls >= MIN_CALLS && aggression < LEAST_AGGRESSION
        ? `Your bets and raises per call after the flop: ${aggression.toFixed(AGGRESSION_DIGITS)} (aim for 1 or more).`
        : null,
    findExamples: ({ hands }) =>
      worstFirst(
        hands.filter(
          (hand) =>
            hand.postflopCalls > 0 && hand.postflopAggressiveActions === 0,
        ),
      ),
  },
  {
    kind: 'killPotLosses',
    title: 'Losing in kill pots',
    advice:
      'Bets are bigger in kill pots. Play tighter and avoid calling down with one-way hands.',
    findEvidence: ({ killHands, killNetPerHand, normalNetPerHand }) =>
      killHands.length >= MIN_KILL_HANDS &&
      killNetPerHand < 0 &&
      killNetPerHand < normalNetPerHand
        ? `You lose ${formatMoney(-killNetPerHand)} per kill pot over ${killHands.length} kill pots.`
        : null,
    findExamples: ({ killHands }) => worstFirst(killHands),
  },
] as const;
