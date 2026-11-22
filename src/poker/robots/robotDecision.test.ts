import type { LegalDecision } from '@poker/engine/tableTypes';
import { describe, expect, test } from 'vitest';

import type { RobotSituation } from './robotDecision';
import { decideRobotAction } from './robotDecision';
import { ROBOT_PERSONALITIES } from './robotPersonalities';

const FACING_A_RAISE: LegalDecision[] = [
  { decision: 'fold', amount: 0 },
  { decision: 'call', amount: 4 },
  { decision: 'raise', amount: 6 },
];

const NO_BLUFF = 0.99;

const situation = (overrides: Partial<RobotSituation>): RobotSituation => ({
  legalDecisions: FACING_A_RAISE,
  personality: ROBOT_PERSONALITIES.regular,
  street: 'preflop',
  handStrength: 0.3,
  playersInHand: 4,
  amountToCall: 4,
  potTotal: 12,
  raisesThisStreet: 1,
  ...overrides,
});

describe('decideRobotAction', () => {
  test('a rock folds a middling hand that a calling station plays', () => {
    const middling = { handStrength: 0.3 };
    const rock = situation({
      ...middling,
      personality: ROBOT_PERSONALITIES.rock,
    });
    const station = situation({
      ...middling,
      personality: ROBOT_PERSONALITIES.callingStation,
    });

    expect(decideRobotAction(rock, NO_BLUFF)).toBe('fold');
    expect(decideRobotAction(station, NO_BLUFF)).toBe('call');
  });

  test('premium starting hands raise', () => {
    expect(decideRobotAction(situation({ handStrength: 0.8 }), NO_BLUFF)).toBe(
      'raise',
    );
  });

  test('after the flop, weak hands check when free and fold to bets', () => {
    const weak = { street: 'flop' as const, handStrength: 0.05 };
    const checkedTo = situation({
      ...weak,
      amountToCall: 0,
      legalDecisions: [
        { decision: 'check', amount: 0 },
        { decision: 'bet', amount: 4 },
      ],
    });

    expect(decideRobotAction(checkedTo, NO_BLUFF)).toBe('check');
    expect(decideRobotAction(situation(weak), NO_BLUFF)).toBe('fold');
  });

  test('a strong share of the pot bets for value, and a maniac bluffs heads-up', () => {
    const strong = situation({ street: 'turn', handStrength: 0.7 });
    const maniacBluff = situation({
      street: 'turn',
      handStrength: 0.05,
      playersInHand: 2,
      personality: ROBOT_PERSONALITIES.maniac,
    });

    expect(decideRobotAction(strong, NO_BLUFF)).toBe('raise');
    expect(decideRobotAction(maniacBluff, 0.1)).toBe('raise');
  });

  test('a maniac checks a weak hand multiway instead of bluffing', () => {
    const multiway = situation({
      street: 'turn',
      handStrength: 0.05,
      playersInHand: 5,
      amountToCall: 0,
      legalDecisions: [
        { decision: 'check', amount: 0 },
        { decision: 'bet', amount: 4 },
      ],
      personality: ROBOT_PERSONALITIES.maniac,
    });

    expect(decideRobotAction(multiway, 0.1)).toBe('check');
  });
});
