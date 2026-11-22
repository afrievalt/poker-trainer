import type {
  HandRecord,
  HeroDecisionRecord,
} from '@poker/tracking/trackingTypes';
import { describe, expect, test } from 'vitest';

import { buildCoachingTips, flagsForHand } from './coachingPlan';
import { flagDecision } from './decisionFlags';

const decision = (
  overrides: Partial<HeroDecisionRecord>,
): HeroDecisionRecord => ({
  handNumber: 1,
  street: 'river',
  position: 'late',
  decision: 'call',
  amountToCall: 8,
  potTotal: 24,
  handStrength: 0.5,
  playersInHand: 2,
  isKillHand: false,
  ...overrides,
});

const hand = (
  handNumber: number,
  overrides: Partial<HandRecord> = {},
): HandRecord => ({
  handId: `test-${handNumber}`,
  playedAt: handNumber,
  handNumber,
  isDealtIn: true,
  position: 'late',
  holeCards: [],
  board: [],
  netResult: 0,
  sawFlop: false,
  wentToShowdown: false,
  wonAtShowdown: false,
  wonMoney: false,
  didScoop: false,
  isKillHand: false,
  isHeroKiller: false,
  voluntarilyPutMoneyIn: false,
  raisedPreflop: false,
  postflopAggressiveActions: 0,
  postflopCalls: 0,
  historyLines: [],
  decisions: [],
  robotNotes: [],
  playerNote: '',
  ...overrides,
});

describe('flagDecision', () => {
  test('flags a call without the odds', () => {
    const flag = flagDecision(decision({ handStrength: 0.1 }));

    expect(flag?.kind).toBe('calledWithoutOdds');
    expect(flag?.message).toBe(
      'Called $8 without the odds: needed 25%, had about 10% of the pot.',
    );
  });

  test('flags folding with a good price and checking a monster', () => {
    expect(flagDecision(decision({ decision: 'fold' }))?.kind).toBe(
      'foldedWithOdds',
    );
    expect(
      flagDecision(
        decision({ decision: 'check', amountToCall: 0, handStrength: 0.95 }),
      )?.kind,
    ).toBe('missedValue');
  });

  test('flags weak starting hands, with a stricter bar in kill pots', () => {
    const preflop = { street: 'preflop' as const, handStrength: 0.25 };

    expect(flagDecision(decision(preflop))).toBeNull();
    expect(flagDecision(decision({ ...preflop, isKillHand: true }))?.kind).toBe(
      'weakStartingHand',
    );
  });

  test('leaves sound decisions alone', () => {
    expect(flagDecision(decision({ handStrength: 0.3 }))).toBeNull();
  });
});

describe('buildCoachingTips', () => {
  test('ranks repeated flagged decisions and links example hands', () => {
    const badCall = decision({ handStrength: 0.05 });
    const hands = [1, 2, 3, 4].map((handNumber) =>
      hand(handNumber, { decisions: [badCall] }),
    );
    const [topTip] = buildCoachingTips(hands);

    expect(flagsForHand(hands[0])).toHaveLength(1);
    expect(topTip.title).toBe('Calling without the odds');
    expect(topTip.evidence).toBe('4 flagged decisions in 4 hands.');
    expect(topTip.exampleHandIds).toEqual(['test-4', 'test-3', 'test-2']);
  });

  test('counts a weak starting hand once per hand', () => {
    const weakCall = decision({ street: 'preflop', handStrength: 0.1 });
    const twoPreflopCalls = hand(1, { decisions: [weakCall, weakCall] });

    expect(flagsForHand(twoPreflopCalls)).toHaveLength(1);
  });

  test('finds stat leaks once there are enough hands', () => {
    const looseHands = Array.from({ length: 25 }, (_unused, handNumber) =>
      hand(handNumber, { voluntarilyPutMoneyIn: handNumber % 5 !== 0 }),
    );
    const titles = buildCoachingTips(looseHands).map(({ title }) => title);

    expect(titles).toContain('Playing too many hands');
    expect(titles).toContain('Not raising good starting hands');
    expect(buildCoachingTips(looseHands.slice(0, 10))).toEqual([]);
  });
});
